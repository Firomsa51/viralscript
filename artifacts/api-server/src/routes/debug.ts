import { Router, type IRouter } from "express";
import { groq } from "../lib/groq";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/debug", async (req, res): Promise<void> => {
  const report: Record<string, unknown> = {};

  // --- Env checks ---
  const apiKey = process.env.GROQ_API_KEY ?? "";
  report.groq_key_set = apiKey.length > 0;
  report.groq_key_prefix = apiKey.length > 10 ? apiKey.slice(0, 10) + "..." : "(too short or missing)";

  const dbUrl = process.env.DATABASE_URL ?? "";
  report.db_url_set = dbUrl.length > 0;
  report.db_url_is_placeholder = dbUrl.includes("user:password@host");

  // --- Groq API test ---
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Reply with the single word: OK" }],
      max_tokens: 5,
    });
    report.groq_api = "ok";
    report.groq_response = completion.choices[0]?.message?.content?.trim();
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    report.groq_api = "error";
    report.groq_error_status = e.status;
    report.groq_error_message = e.message;
    req.log.error({ err }, "Groq API test failed");
  }

  // --- DB test ---
  if (report.db_url_is_placeholder) {
    report.db = "skipped — DATABASE_URL is still the placeholder value";
  } else {
    try {
      await db.execute(sql`SELECT 1`);
      report.db = "ok";
    } catch (err: unknown) {
      const e = err as { message?: string };
      report.db = "error";
      report.db_error = e.message;
      req.log.error({ err }, "DB connection test failed");
    }
  }

  const allOk = report.groq_api === "ok" && report.db === "ok";
  res.status(allOk ? 200 : 500).json(report);
});

export default router;
