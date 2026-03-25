import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Shield, Brain } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;
const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
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

  // Prepare chart data
  const rounds = simData?.rounds || [];
  const sentimentData = rounds.map((r, i) => ({
    round: `R${i + 1}`,
    sentiment: r.market_event?.market_sentiment || 50,
    avgSuccess: r.snapshot?.avg_success_probability || 0,
    funding: (r.snapshot?.total_funding_deployed || 0) / 1000,
  }));

  const startups = simData?.startup_ranking || [];
  const statusCounts = {};
  startups.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Risk heatmap data
  const riskData = rounds.length > 0
    ? (rounds[rounds.length - 1].risk_assessments || []).map(r => ({
        name: r.startup,
        financial: r.breakdown?.financial_risk || 0,
        market: r.breakdown?.market_risk || 0,
        team: r.breakdown?.team_risk || 0,
        competition: r.breakdown?.competition_risk || 0,
        overall: r.overall_risk,
      }))
    : [];

  // Investor ROI data
  const investors = simData?.investor_ranking || [];
  const roiData = investors.map(inv => ({
    name: inv.name.split(' ').slice(0, 2).join(' '),
    invested: inv.total_invested / 1000,
    returns: inv.total_returns / 1000,
    roi: inv.roi,
  }));

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">Simulation Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive charts and visualizations</p>
      </div>

      {/* Market Sentiment + Success Rate Over Rounds */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-purple-500" /> Market Sentiment & Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="round" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="sentiment" stroke="#8b5cf6" strokeWidth={2} name="Market Sentiment" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avgSuccess" stroke="#22c55e" strokeWidth={2} name="Avg Success %" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funding Over Rounds */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" /> Cumulative Funding ($K)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="round" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="funding" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Funding ($K)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Risk Heatmap (as bar chart) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-orange-500" /> Risk Breakdown by Startup</CardTitle>
        </CardHeader>
        <CardContent>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="financial" fill="#ef4444" name="Financial" stackId="a" />
                <Bar dataKey="market" fill="#8b5cf6" name="Market" stackId="a" />
                <Bar dataKey="team" fill="#3b82f6" name="Team" stackId="a" />
                <Bar dataKey="competition" fill="#eab308" name="Competition" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No risk data available</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
