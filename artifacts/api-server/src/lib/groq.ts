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
  audience: string;
  hookStyle: string;
}

export interface ScriptResult {
  script: string;
  hook: string;
  hashtags: string[];
}

const hookStyleGuide: Record<string, string> = {
  "question": "Open with a provocative question that makes the viewer think",
  "shocking-stat": "Open with a surprising statistic or number that stops scrolling",
  "bold-claim": "Open with a bold, counterintuitive claim that challenges assumptions",
  "story": "Open by dropping the viewer into the middle of a compelling story",
  "challenge": "Open by directly challenging the viewer or calling out a common mistake",
  "how-to": "Open by promising a specific actionable outcome the viewer will get",
};

const platformTemplates: Record<string, (req: ScriptRequest) => string> = {
  tiktok: (req) => `You are a top TikTok creator with 10M+ followers who consistently goes viral.

Write a TikTok script optimized for the For You Page algorithm.
Topic: ${req.topic}
Target Audience: ${req.audience}
Tone: ${req.tone}
Duration: ${req.duration === "short" ? "15-30 seconds" : req.duration === "medium" ? "30-60 seconds" : "60-90 seconds"}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}

TikTok-specific rules:
- The hook must land in the FIRST 2 seconds — no warm-up
- Use pattern interrupts every 5-7 seconds [PAUSE], [ZOOM], [CUT TO], [TEXT ON SCREEN]
- Mirror casual Gen-Z speech patterns
- End with a loop hook or open loop that brings viewers back
- Include a strong CTA (follow, comment, duet)

Respond ONLY with valid JSON:
{
  "hook": "The exact first line spoken on camera",
  "script": "Full script with [DIRECTION] cues integrated naturally",
  "hashtags": ["hashtag1","hashtag2","hashtag3","hashtag4","hashtag5","hashtag6","hashtag7"]
}`,

  instagram: (req) => `You are an Instagram Reels strategist who creates consistently viral aesthetic content.

Write an Instagram Reels script.
Topic: ${req.topic}
Target Audience: ${req.audience}
Tone: ${req.tone}
Duration: ${req.duration === "short" ? "15-30 seconds" : req.duration === "medium" ? "30-60 seconds" : "60-90 seconds"}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}

Instagram-specific rules:
- Aesthetic and aspirational framing — viewers imagine themselves in the scenario
- Use [B-ROLL:] cues to suggest visuals for each section
- Include text overlay suggestions [TEXT:] at key moments
- Trending audio style note at the start
- End with a save-worthy insight or transformation

Respond ONLY with valid JSON:
{
  "hook": "The exact opening line or text overlay",
  "script": "Full script with [B-ROLL:] and [TEXT:] cues",
  "hashtags": ["hashtag1","hashtag2","hashtag3","hashtag4","hashtag5","hashtag6","hashtag7"]
}`,

  youtube: (req) => `You are a YouTube Shorts creator who optimizes for watch-through rate and subscriber conversion.

Write a YouTube Shorts script.
Topic: ${req.topic}
Target Audience: ${req.audience}
Tone: ${req.tone}
Duration: ${req.duration === "short" ? "30-45 seconds" : req.duration === "medium" ? "45-60 seconds" : "55-60 seconds"}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}

YouTube Shorts rules:
- Hook must create immediate curiosity gap
- Build tension through the middle
- Deliver a satisfying payoff at the end
- Include a subscribe CTA that feels natural
- [SCREEN TEXT:] overlays for key facts

Respond ONLY with valid JSON:
{
  "hook": "The exact opening line",
  "script": "Full script with [SCREEN TEXT:] cues",
  "hashtags": ["Shorts","hashtag2","hashtag3","hashtag4","hashtag5"]
}`,

  "youtube-long": (req) => `You are a YouTube creator who consistently hits 100K+ views on long-form content.

Write a detailed YouTube video script outline.
Topic: ${req.topic}
Target Audience: ${req.audience}
Tone: ${req.tone}
Duration: ${req.duration === "short" ? "5-7 minutes" : req.duration === "medium" ? "8-12 minutes" : "15-20 minutes"}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}

YouTube long-form rules:
- Open loop in the intro — tease the payoff, don't give it away
- Structure: Hook → Problem Agitation → Promise → Content Delivery → CTA
- Include [B-ROLL SUGGESTION:] at key story beats
- Re-engagement hooks after every 2-3 minutes to prevent drop-off
- Mid-roll CTA placement [MID-ROLL CTA] and end screen CTA
- Pattern interrupts: personal story, surprising stat, or expert quote every 3 minutes

Respond ONLY with valid JSON:
{
  "hook": "The exact opening 3 sentences spoken to camera",
  "script": "Full detailed script with [SECTION:], [B-ROLL:], and [CTA:] markers",
  "hashtags": ["hashtag1","hashtag2","hashtag3","hashtag4","hashtag5"]
}`,

  twitter: (req) => `You are a Twitter/X power user with a highly engaged audience of ${req.audience}.

Write a Twitter/X thread or post.
Topic: ${req.topic}
Tone: ${req.tone}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}
Format: ${req.duration === "short" ? "Single viral tweet (max 280 chars)" : req.duration === "medium" ? "3-5 tweet thread" : "7-10 tweet thread"}

Twitter/X rules:
- First tweet is the hook — must make people NEED to click "more" or reply
- Each tweet in a thread ends with a reason to read the next
- White space and line breaks for scanability
- Include a reply baiting question at the end
- No hashtag spam — max 2 relevant tags

Respond ONLY with valid JSON:
{
  "hook": "The exact first tweet text",
  "script": "Full thread with each tweet separated by ---TWEET--- delimiter",
  "hashtags": ["hashtag1","hashtag2"]
}`,

  linkedin: (req) => `You are a LinkedIn thought leader who generates thousands of reactions and shares.

Write a LinkedIn post.
Topic: ${req.topic}
Target Audience: ${req.audience} (professional context)
Tone: ${req.tone}
Hook Style: ${hookStyleGuide[req.hookStyle] ?? req.hookStyle}
Length: ${req.duration === "short" ? "Short post (150-300 words)" : req.duration === "medium" ? "Medium post (300-500 words)" : "Long-form post (600-900 words)"}

LinkedIn rules:
- First line must hook before the "...see more" cutoff (max 2 lines)
- Use single-sentence paragraphs for mobile readability
- Share a personal insight, lesson learned, or contrarian take
- Include a data point or specific example for credibility
- End with an engagement question that invites professional discussion
- No clickbait — LinkedIn penalizes it; authenticity wins

Respond ONLY with valid JSON:
{
  "hook": "The exact opening 1-2 lines",
  "script": "Full post text formatted for LinkedIn",
  "hashtags": ["hashtag1","hashtag2","hashtag3"]
}`,
};

export async function generateViralScript(req: ScriptRequest): Promise<ScriptResult> {
  const templateFn = platformTemplates[req.platform] ?? platformTemplates["tiktok"];
  const prompt = templateFn(req);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.88,
    max_tokens: 3000,
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
