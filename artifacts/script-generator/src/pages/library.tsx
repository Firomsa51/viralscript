import { useState } from "react";
import { useListScripts, useDeleteScript, getListScriptsQueryKey, getGetScriptStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, Library, Sparkles, Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function LibraryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedScript, setSelectedScript] = useState<any | null>(null);

  const { data: scripts, isLoading } = useListScripts(
    platformFilter !== "all" ? { platform: platformFilter } : undefined
  );

  const deleteScript = useDeleteScript();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScript.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListScriptsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetScriptStatsQueryKey() });
          toast({ title: "Script deleted", description: "Removed from your library." });
          if (selectedScript?.id === id) {
            setSelectedScript(null);
          }
        },
      }
    );
  };

  const handleCopy = async (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-8 pt-8 md:pt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <Library className="w-8 h-8 text-primary" />
            Script Vault
          </h1>
          <p className="text-muted-foreground">Your personal arsenal of viral hits.</p>
        </div>

        <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : scripts?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-card/20">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-xl font-bold mb-2">It's quiet in here...</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            You haven't saved any scripts yet. Head over to the generator to create your first viral hit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {scripts?.map((script) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card 
                  className="bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-[280px]"
                  onClick={() => setSelectedScript(script)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-background text-primary border-primary/30">
                        {script.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(script.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {script.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <p className="text-sm font-serif italic text-muted-foreground line-clamp-3 mb-3">
                      &ldquo;{script.hook}&rdquo;
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs">
                        {script.tone}
                      </Badge>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                        {script.duration}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t border-border flex justify-end gap-2 bg-muted/20">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleCopy(script.script, e)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(script.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Script Detail Dialog */}
      <Dialog open={!!selectedScript} onOpenChange={(open) => !open && setSelectedScript(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-background border-primary/20">
          {selectedScript && (
            <>
              <DialogHeader className="shrink-0 border-b border-border pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {selectedScript.platform}
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    {selectedScript.tone}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(new Date(selectedScript.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
                <DialogTitle className="text-2xl">{selectedScript.topic}</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">The Hook</p>
                  <p className="text-xl font-serif italic text-foreground">&ldquo;{selectedScript.hook}&rdquo;</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedScript.script}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedScript.hashtags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="shrink-0 pt-4 border-t border-border flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={(e) => handleDelete(selectedScript.id, e)}
                  className="bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedScript(null)}>
                    Close
                  </Button>
                  <Button onClick={() => handleCopy(selectedScript.script)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Script
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
