import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateScript, useSaveScript, getGetScriptStatsQueryKey, getListScriptsQueryKey, getGetRecentScriptsQueryKey } from "@workspace/api-client-react";
import type { GeneratedScript, GenerateScriptBody } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Copy, Save, Sparkles, RefreshCw, CheckCircle2, Zap, AlertCircle } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  platform: z.enum(["tiktok", "instagram", "youtube", "youtube-long", "twitter", "linkedin"]),
  tone: z.enum(["funny", "hype", "serious", "inspirational", "educational", "storytelling", "controversial"]),
  duration: z.enum(["short", "medium", "long"]),
  audience: z.string().min(2, "Describe your target audience"),
  hookStyle: z.enum(["question", "shocking-stat", "bold-claim", "story", "challenge", "how-to"]),
});

export function HomePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const generateScript = useGenerateScript();
  const saveScript = useSaveScript();

  const [generatedResult, setGeneratedResult] = useState<GeneratedScript | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      platform: "tiktok",
      tone: "educational",
      duration: "short",
      audience: "general audience",
      hookStyle: "question",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMessage(null);
    generateScript.mutate(
      { data: values as GenerateScriptBody },
      {
        onSuccess: (data) => {
          setGeneratedResult(data);
          queryClient.invalidateQueries({ queryKey: getGetScriptStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentScriptsQueryKey() });
          toast({ title: "Script generated!", description: "Your viral script is ready." });
        },
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { error?: string; detail?: string } } };
          const msg = e.response?.data?.detail ?? e.response?.data?.error ?? "Something went wrong while generating the script.";
          setErrorMessage(msg);
          toast({ variant: "destructive", title: "Generation failed", description: msg });
        },
      }
    );
  }

  const handleSave = () => {
    if (!generatedResult) return;
    saveScript.mutate(
      { id: generatedResult.id },
      {
        onSuccess: () => {
          setGeneratedResult({ ...generatedResult, saved: true });
          queryClient.invalidateQueries({ queryKey: getListScriptsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetScriptStatsQueryKey() });
          toast({ title: "Saved to Library", description: "You can access this script later." });
        },
      }
    );
  };

  const handleCopy = async () => {
    if (!generatedResult) return;
    await navigator.clipboard.writeText(generatedResult.script);
    setCopied(true);
    toast({ title: "Copied to clipboard", description: "Script ready to paste." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 md:p-8 pt-8 md:pt-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Create <span className="text-primary">Viral</span> Content
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Dial in your platform, audience, and hook style — then get a script optimised for maximum engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Script Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic / Core Idea</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The secret to perfect espresso..." className="bg-background/50 border-input" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., beginner entrepreneurs, fitness enthusiasts..." className="bg-background/50 border-input" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-input">
                                <SelectValue placeholder="Platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="instagram">Instagram Reels</SelectItem>
                              <SelectItem value="youtube">YouTube Shorts</SelectItem>
                              <SelectItem value="youtube-long">YouTube Long-form</SelectItem>
                              <SelectItem value="twitter">Twitter / X</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-input">
                                <SelectValue placeholder="Tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="educational">Educational</SelectItem>
                              <SelectItem value="funny">Funny</SelectItem>
                              <SelectItem value="hype">Hype / Energetic</SelectItem>
                              <SelectItem value="inspirational">Inspirational</SelectItem>
                              <SelectItem value="serious">Serious</SelectItem>
                              <SelectItem value="storytelling">Storytelling</SelectItem>
                              <SelectItem value="controversial">Controversial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hookStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hook Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-input">
                                <SelectValue placeholder="Hook" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="question">Question</SelectItem>
                              <SelectItem value="shocking-stat">Shocking Stat</SelectItem>
                              <SelectItem value="bold-claim">Bold Claim</SelectItem>
                              <SelectItem value="story">Story Drop</SelectItem>
                              <SelectItem value="challenge">Challenge</SelectItem>
                              <SelectItem value="how-to">How-To Promise</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-input">
                                <SelectValue placeholder="Duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short">Short</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full mt-4 text-primary-foreground font-bold hover-elevate shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
                    disabled={generateScript.isPending}
                    size="lg"
                  >
                    {generateScript.isPending ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate Script
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 min-h-[500px]">
          <AnimatePresence mode="wait">
            {generateScript.isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/20"
              >
                <div className="flex flex-col items-center text-primary">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-mono tracking-widest uppercase text-sm">Synthesizing...</p>
                </div>
              </motion.div>
            ) : generatedResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 h-full flex flex-col"
              >
                <Card className="border-primary/50 bg-card overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.1)] flex-1 flex flex-col">
                  <div className="bg-primary/10 p-4 border-b border-primary/20">
                    <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">The Hook</p>
                    <p className="text-xl font-serif italic text-foreground leading-relaxed">&ldquo;{generatedResult.hook}&rdquo;</p>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {generatedResult.hashtags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Textarea
                      readOnly
                      value={generatedResult.script}
                      className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed border-none bg-transparent focus-visible:ring-0 p-0 text-muted-foreground"
                    />
                  </CardContent>
                  <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCopy} className="hover-elevate">
                      {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied" : "Copy text"}
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSave}
                      disabled={generatedResult.saved || saveScript.isPending}
                      className="hover-elevate"
                    >
                      {generatedResult.saved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Library
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/20 text-muted-foreground"
              >
                <div className="text-center p-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">Waiting for input...</h3>
                  <p className="max-w-xs mx-auto">Set your parameters on the left to start generating your next viral hit.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
