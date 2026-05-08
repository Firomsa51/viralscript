import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY must be set.");
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ScriptRequest {
  topic: string;
  platform: string;
  tone: string;
  duration: string;
}

export interface ScriptResult {
  script: string;
  hook: string;
  hashtags: string[];
}

const durationGuide: Record<string, string> = {
  short: "30-60 seconds",
  medium: "1-3 minutes",
  long: "5-10 minutes",
};

const platformGuide: Record<string, string> = {
  tiktok: "TikTok (fast-paced, trend-aware, youth culture)",
  instagram: "Instagram Reels (aesthetic, lifestyle-focused)",
  youtube: "YouTube (more detailed, can include storytelling arcs)",
  twitter: "Twitter/X (punchy, opinionated, debate-sparking)",
  linkedin: "LinkedIn (professional, insight-driven, thought leadership)",
};

export async function generateViralScript(req: ScriptRequest): Promise<ScriptResult> {
  const platformDesc = platformGuide[req.platform] ?? req.platform;
  const durationDesc = durationGuide[req.duration] ?? req.duration;

  const prompt = `You are a viral content strategist who writes scripts that consistently get millions of views.

Generate a ${req.tone} social media script for ${platformDesc}.
Topic: ${req.topic}
Duration: approximately ${durationDesc}

Requirements:
- Open with an irresistible hook that stops scrolling in the first 3 seconds
- Write the full script optimized for virality on ${req.platform}
- Match the ${req.tone} tone throughout
- Include natural pauses and energy cues [like this]
- End with a strong call to action

Respond ONLY with valid JSON in this exact format:
{
  "hook": "The exact opening line that grabs attention",
  "script": "The complete script text with [stage directions] and natural flow",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from Groq");
  }

  const parsed = JSON.parse(content) as ScriptResult;
  return {
    hook: String(parsed.hook ?? ""),
    script: String(parsed.script ?? ""),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
  };
}
