import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, TrendingUp, Zap } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

export default function FundingRoundsPage() {
  const { currentSimulation, getAuthHeaders } = useAuth();
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSimulation) return;
    const headers = getAuthHeaders();
    axios.get(`${API}/simulations/${currentSimulation.id}`, { headers })
      .then(res => setSimData(res.data?.results || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentSimulation, getAuthHeaders]);

  if (!currentSimulation) return <p className="text-center py-20 text-muted-foreground">Select a simulation first</p>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const rounds = simData?.rounds || [];

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">Funding Rounds</h1>
        <p className="text-sm text-muted-foreground mt-1">Step-by-step view of each funding round</p>
      </div>

      {rounds.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No round data available</p>
      ) : (
        <Tabs defaultValue="1">
          <TabsList className="flex flex-wrap gap-1">
            {rounds.map((_, i) => (
              <TabsTrigger key={i} value={String(i + 1)}>Round {i + 1}</TabsTrigger>
            ))}
          </TabsList>

          {rounds.map((round, i) => (
            <TabsContent key={i} value={String(i + 1)} className="space-y-6">
              {/* Market Event */}
              <Card className="glass-card border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-purple-500" /> Market Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={round.market_event?.event_type === 'boom' ? 'default' : round.market_event?.event_type === 'crash' ? 'destructive' : 'secondary'}>
                      {round.market_event?.event_type}
                    </Badge>
                    <span className="text-sm">Impact: {round.market_event?.impact_score > 0 ? '+' : ''}{round.market_event?.impact_score}</span>
                    <span className="text-sm text-muted-foreground">Sentiment: {round.market_event?.market_sentiment}/100</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{round.market_event?.description}</p>
                </CardContent>
              </Card>

              {/* Funding Decisions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" /> Funding Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(round.funding_decisions || []).map((d, j) => (
                      <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                        <div className="flex items-center gap-3">
                          {d.decision === 'funded' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{d.investor} → {d.startup}</p>
                            <p className="text-xs text-muted-foreground">{d.reasoning}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={d.decision === 'funded' ? 'default' : 'destructive'}>
                            {d.decision}
                          </Badge>
                          {d.decision === 'funded' && (
                            <p className="text-xs text-green-500 mt-1">${(d.amount || 0).toLocaleString()} ({d.equity_percentage}% equity)</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(round.funding_decisions || []).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No decisions in this round</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Round Snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{round.snapshot?.active_startups || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Startups</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">{round.snapshot?.failed_startups || 0}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">${((round.snapshot?.total_funding_deployed || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Total Funded</p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{round.snapshot?.avg_success_probability || 0}%</p>
                    <p className="text-xs text-muted-foreground">Avg Success</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
