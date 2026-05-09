import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, scriptsTable } from "@workspace/db";
import { generateViralScript } from "../lib/groq";
import {
  GenerateScriptBody,
  ListScriptsQueryParams,
  GetScriptParams,
  DeleteScriptParams,
  SaveScriptParams,
  GenerateScriptResponse,
  ListScriptsResponse,
  GetScriptResponse,
  SaveScriptResponse,
  GetScriptStatsResponse,
  GetRecentScriptsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/scripts/generate", async (req, res): Promise<void> => {
  const parsed = GenerateScriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, platform, tone, duration } = parsed.data;

  // --- Groq generation ---
  let result;
  try {
    result = await generateViralScript({ topic, platform, tone, duration });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; error?: { message?: string } };
    const detail = e.error?.message ?? e.message ?? String(err);
    req.log.error({ err, status: e.status }, "Groq API call failed");
    res.status(502).json({
      error: "Groq API call failed",
      detail,
      groq_status: e.status,
    });
    return;
  }

  // --- Persist to DB ---
  let script;
  try {
    const [row] = await db
      .insert(scriptsTable)
      .values({
        topic,
        platform,
        tone,
        duration,
        script: result.script,
        hook: result.hook,
        hashtags: result.hashtags,
        saved: false,
      })
      .returning();
    script = row;
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB insert failed after successful Groq generation");
    res.status(500).json({
      error: "Script generated but could not be saved to the database",
      detail: e.message,
      // Still return the generated content so the user isn't left empty-handed
      generated: result,
    });
    return;
  }

  res.json(GenerateScriptResponse.parse(script));
});

router.get("/scripts/stats", async (req, res): Promise<void> => {
  let allScripts;
  try {
    allScripts = await db.select().from(scriptsTable);
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB query failed for stats");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  const total = allScripts.length;
  const saved = allScripts.filter((s) => s.saved).length;

  const byPlatform: Record<string, number> = {};
  const byTone: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};

  for (const s of allScripts) {
    byPlatform[s.platform] = (byPlatform[s.platform] ?? 0) + 1;
    byTone[s.tone] = (byTone[s.tone] ?? 0) + 1;
    topicCounts[s.topic] = (topicCounts[s.topic] ?? 0) + 1;
  }

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  res.json(GetScriptStatsResponse.parse({ total, saved, byPlatform, byTone, topTopics }));
});

router.get("/scripts/recent", async (req, res): Promise<void> => {
  let scripts;
  try {
    scripts = await db
      .select()
      .from(scriptsTable)
      .orderBy(desc(scriptsTable.createdAt))
      .limit(10);
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB query failed for recent scripts");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  res.json(GetRecentScriptsResponse.parse(scripts));
});

router.get("/scripts", async (req, res): Promise<void> => {
  const params = ListScriptsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let scripts;
  try {
    let query = db.select().from(scriptsTable).$dynamic();
    if (params.data.platform) {
      query = query.where(eq(scriptsTable.platform, params.data.platform));
    }
    const limit = params.data.limit ?? 50;
    query = query.orderBy(desc(scriptsTable.createdAt)).limit(limit);
    scripts = await query;
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB query failed for scripts list");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  res.json(ListScriptsResponse.parse(scripts));
});

router.get("/scripts/:id", async (req, res): Promise<void> => {
  const params = GetScriptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let script;
  try {
    const [row] = await db
      .select()
      .from(scriptsTable)
      .where(eq(scriptsTable.id, params.data.id));
    script = row;
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB query failed for script lookup");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  if (!script) {
    res.status(404).json({ error: "Script not found" });
    return;
  }

  res.json(GetScriptResponse.parse(script));
});

router.delete("/scripts/:id", async (req, res): Promise<void> => {
  const params = DeleteScriptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let script;
  try {
    const [row] = await db
      .delete(scriptsTable)
      .where(eq(scriptsTable.id, params.data.id))
      .returning();
    script = row;
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB delete failed");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  if (!script) {
    res.status(404).json({ error: "Script not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/scripts/:id/save", async (req, res): Promise<void> => {
  const params = SaveScriptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let script;
  try {
    const [row] = await db
      .update(scriptsTable)
      .set({ saved: true })
      .where(eq(scriptsTable.id, params.data.id))
      .returning();
    script = row;
  } catch (err: unknown) {
    const e = err as { message?: string };
    req.log.error({ err }, "DB update failed");
    res.status(500).json({ error: "Database unavailable", detail: e.message });
    return;
  }

  if (!script) {
    res.status(404).json({ error: "Script not found" });
    return;
  }

  res.json(SaveScriptResponse.parse(script));
});

export default router;
