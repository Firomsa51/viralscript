import { useGetScriptStats, useGetRecentScripts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Activity, Layers, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useGetScriptStats();
  const { data: recent, isLoading: recentLoading } = useGetRecentScripts();

  return (
    <div className="container max-w-6xl mx-auto p-6 md:p-8 pt-8 md:pt-12 space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground">Your generation velocity and output metrics.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Generated</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats.total}</h3>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center text-primary">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Scripts created all-time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-secondary/20 hover:border-secondary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Saved to Library</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats.saved}</h3>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Layers className="w-5 h-5 text-secondary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {Math.round((stats.saved / (stats.total || 1)) * 100)}% save rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Top Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats.topTopics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="bg-background">
                      {topic}
                    </Badge>
                  ))}
                  {stats.topTopics.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">No themes yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Where your content goes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byPlatform).sort(([,a], [,b]) => b - a).map(([platform, count]) => {
                    const percentage = Math.round((count / (stats.total || 1)) * 100);
                    return (
                      <div key={platform}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{platform}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.byPlatform).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Tone Breakdown</CardTitle>
                <CardDescription>Your brand voice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byTone).sort(([,a], [,b]) => b - a).map(([tone, count]) => {
                    const percentage = Math.round((count / (stats.total || 1)) * 100);
                    return (
                      <div key={tone}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{tone}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats.byTone).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {recentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : recent && recent.length > 0 ? (
          <div className="space-y-3 border border-border rounded-xl overflow-hidden bg-card/30">
            {recent.map((script, i) => (
              <div 
                key={script.id} 
                className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                  i !== recent.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <p className="font-medium">{script.topic}</p>
                  <p className="text-sm text-muted-foreground">
                    Generated for <span className="capitalize text-primary">{script.platform}</span> • {format(new Date(script.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
                {script.saved && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    Saved
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No recent activity.</p>
        )}
      </div>
    </div>
  );
}
