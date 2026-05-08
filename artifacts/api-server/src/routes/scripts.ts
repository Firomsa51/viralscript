import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
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

  let result;
  try {
    result = await generateViralScript({ topic, platform, tone, duration });
  } catch (err) {
    req.log.error({ err }, "Failed to generate script with Groq");
    res.status(500).json({ error: "Failed to generate script" });
    return;
  }

  const [script] = await db
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

  res.json(GenerateScriptResponse.parse(script));
});

router.get("/scripts/stats", async (req, res): Promise<void> => {
  const allScripts = await db.select().from(scriptsTable);

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
  const scripts = await db
    .select()
    .from(scriptsTable)
    .orderBy(desc(scriptsTable.createdAt))
    .limit(10);

  res.json(GetRecentScriptsResponse.parse(scripts));
});

router.get("/scripts", async (req, res): Promise<void> => {
  const params = ListScriptsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(scriptsTable).$dynamic();

  if (params.data.platform) {
    query = query.where(eq(scriptsTable.platform, params.data.platform));
  }

  const limit = params.data.limit ?? 50;
  query = query.orderBy(desc(scriptsTable.createdAt)).limit(limit);

  const scripts = await query;
  res.json(ListScriptsResponse.parse(scripts));
});

router.get("/scripts/:id", async (req, res): Promise<void> => {
  const params = GetScriptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [script] = await db
    .select()
    .from(scriptsTable)
    .where(eq(scriptsTable.id, params.data.id));

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

  const [script] = await db
    .delete(scriptsTable)
    .where(eq(scriptsTable.id, params.data.id))
    .returning();

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

  const [script] = await db
    .update(scriptsTable)
    .set({ saved: true })
    .where(eq(scriptsTable.id, params.data.id))
    .returning();

  if (!script) {
    res.status(404).json({ error: "Script not found" });
    return;
  }

  res.json(SaveScriptResponse.parse(script));
});

export default router;
