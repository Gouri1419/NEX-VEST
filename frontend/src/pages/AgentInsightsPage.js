import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Rocket, TrendingUp, Shield, Brain } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const agentIcons = {
  startup: Rocket,
  investor: TrendingUp,
  risk: Shield,
  market: Brain,
  system: Bot,
};

const agentColors = {
  startup: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  investor: 'text-green-500 bg-green-500/10 border-green-500/20',
  risk: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  market: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  system: 'text-muted-foreground bg-muted/30 border-border/30',
};

export default function AgentInsightsPage() {
  const { currentSimulation, getAuthHeaders } = useAuth();
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState('all');

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

  const logs = simData?.agent_logs || [];
  const filteredLogs = filterAgent === 'all' ? logs : logs.filter(l => l.agent_type === filterAgent);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">Agent Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">See what each AI agent decided and why</p>
        </div>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="startup">Startup Agent</SelectItem>
            <SelectItem value="investor">Investor Agent</SelectItem>
            <SelectItem value="risk">Risk Agent</SelectItem>
            <SelectItem value="market">Market Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agent stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['startup', 'investor', 'risk', 'market'].map(type => {
          const Icon = agentIcons[type];
          const count = logs.filter(l => l.agent_type === type).length;
          return (
            <Card key={type} className={`glass-card cursor-pointer transition-all ${filterAgent === type ? 'border-primary' : ''}`}
              onClick={() => setFilterAgent(filterAgent === type ? 'all' : type)}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${agentColors[type].split(' ')[0]}`} />
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{type} actions</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Log feed */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Agent Action Log
            <Badge variant="secondary" className="ml-2">{filteredLogs.length} actions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredLogs.map((log, i) => {
                const Icon = agentIcons[log.agent_type] || Bot;
                const colorClass = agentColors[log.agent_type] || agentColors.system;

                return (
                  <div key={i} className={`p-3 rounded-lg border ${colorClass}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{log.agent_type} Agent</span>
                      {log.agent_id && <span className="text-xs text-muted-foreground">({log.agent_id})</span>}
                      <Badge variant="outline" className="ml-auto text-xs">{log.action}</Badge>
                    </div>
                    {log.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.details.reasoning && <p>{log.details.reasoning}</p>}
                        {log.details.amount && <p>Amount: ${log.details.amount.toLocaleString()}</p>}
                        {log.details.startup && <p>Startup: {log.details.startup}</p>}
                        {log.details.description && <p>{log.details.description}</p>}
                        {log.details.event_type && <p>Event: {log.details.event_type} (impact: {log.details.impact_score})</p>}
                        {log.details.overall_risk !== undefined && <p>Risk Score: {log.details.overall_risk} ({log.details.risk_level})</p>}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No agent actions found</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
