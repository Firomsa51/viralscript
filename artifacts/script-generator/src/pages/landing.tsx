import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Zap, BarChart3, BookMarked, Youtube, Linkedin, Twitter, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  { name: "TikTok", emoji: "🎵", color: "from-pink-500 to-rose-500" },
  { name: "YouTube", icon: Youtube, color: "from-red-500 to-red-600" },
  { name: "Instagram", emoji: "📸", color: "from-purple-500 to-pink-500" },
  { name: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-700" },
  { name: "Twitter / X", icon: Twitter, color: "from-sky-500 to-blue-500" },
];

const features = [
  { icon: Sparkles, title: "Platform-specific AI", desc: "Dedicated prompt templates for TikTok, YouTube long-form, LinkedIn posts, and more — not a one-size-fits-all generator." },
  { icon: Zap, title: "Smart prompts", desc: "Define your target audience, hook style, and tone. The AI tailors every script to your exact parameters." },
  { icon: BookMarked, title: "Script library", desc: "Save your best scripts, filter by platform, and revisit them whenever you need inspiration." },
  { icon: BarChart3, title: "Usage stats", desc: "Track how many scripts you've generated, your favourite platforms, and your most-used topics." },
];

const proofPoints = [
  "YouTube long-form (5–20 min scripts with B-roll cues)",
  "TikTok / Reels (with pattern interrupt directions)",
  "LinkedIn thought-leadership posts",
  "Twitter / X threads",
  "6 hook styles: question, shocking stat, bold claim, story, challenge, how-to",
];

export function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">ViralScript</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/sign-in")}>Sign in</Button>
            <Button size="sm" onClick={() => navigate("/sign-up")} className="shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              Start free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by Groq · llama-3.3-70b-versatile
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
            Scripts that actually<br />
            <span className="text-primary">go viral.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            AI-generated scripts tailored for every platform — with platform-native hooks, pacing cues, and audience targeting built in. Not generic. Not bland.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" onClick={() => navigate("/sign-up")} className="text-base px-8 shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_35px_rgba(0,255,255,0.6)] transition-all">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate your first script free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/sign-in")} className="text-base px-8">
              Sign in
            </Button>
          </div>
        </motion.div>

        {/* Platform pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-16"
        >
          {platforms.map((p) => (
            <div key={p.name} className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${p.color} text-white text-sm font-semibold shadow-lg`}>
              {p.emoji ? <span>{p.emoji}</span> : p.icon ? <p.icon className="w-4 h-4" /> : null}
              {p.name}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="container max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything a content creator needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card/50 hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof list */}
      <section className="container max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-8">What's included</h2>
          <ul className="space-y-3 text-left max-w-lg mx-auto">
            {proofPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
          <Button size="lg" onClick={() => navigate("/sign-up")} className="mt-10 shadow-[0_0_25px_rgba(0,255,255,0.4)]">
            Get started — it's free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">ViralScript</span>
        </div>
        <p>AI-powered scripts for content creators</p>
      </footer>
    </div>
  );
}
