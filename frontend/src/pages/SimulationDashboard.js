import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Rocket, TrendingUp, AlertTriangle, BarChart3, Zap, Bot, Brain, Shield,
  ArrowRight, DollarSign, Target, Activity, Users, CheckCircle, XCircle, Trophy
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;
const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

// Agent Pipeline Step Component
function PipelineStep({ icon: Icon, label, description, color, isActive, delay }) {
  return (
    <div
      className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-500 ${
        isActive
          ? `border-${color}/50 bg-${color}/10 shadow-lg shadow-${color}/20`
          : 'border-border/30 bg-muted/20'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`p-2 rounded-lg mb-2 ${isActive ? `bg-${color}/20` : 'bg-muted/30'}`}>
        <Icon className={`h-5 w-5 ${isActive ? `text-${color}` : 'text-muted-foreground'}`} />
      </div>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

// Risk Heatmap Cell
function RiskCell({ value, label }) {
  const getBg = (v) => {
    if (v >= 70) return 'bg-red-500/80 text-white';
    if (v >= 50) return 'bg-orange-500/70 text-white';
    if (v >= 30) return 'bg-yellow-500/60 text-black';
    return 'bg-green-500/50 text-white';
  };
  return (
    <div className={`rounded-md p-2 text-center ${getBg(value)}`} title={`${label}: ${value}`}>
      <p className="text-xs font-bold">{Math.round(value)}</p>
    </div>
  );
}

export default function SimulationDashboard() {
  const { simulations, getAuthHeaders, currentSimulation, setCurrentSimulation } = useAuth();
  const navigate = useNavigate();
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (simulations.length === 0) return;
    const latest = currentSimulation || simulations[0];
    setCurrentSimulation(latest);

    if (latest.status === 'completed') {
      setLoading(true);
      const headers = getAuthHeaders();
      axios.get(`${API}/simulations/${latest.id}`, { headers })
        .then(res => setSimData(res.data?.results || null))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [simulations, currentSimulation, getAuthHeaders, setCurrentSimulation]);

  // Animate pipeline steps
  useEffect(() => {
    if (!simData) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 7);
    }, 2000);
    return () => clearInterval(interval);
  }, [simData]);

  if (simulations.length === 0) {
    return (
      <div className="text-center py-20 fade-in">
        <Brain className="h-16 w-16 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-3">No Simulations Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create your first simulation to watch AI agents compete in the startup ecosystem.
        </p>
        <Button className="btn-primary px-8" onClick={() => navigate('/setup')}>
          <Zap className="h-4 w-4 mr-2" /> Create First Simulation
        </Button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  const summary = simData?.summary || {};
  const rounds = simData?.rounds || [];
  const startups = simData?.startup_ranking || [];
  const investors = simData?.investor_ranking || [];

  // --- Chart Data ---
  const fmt = (v) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`;

  const fundingPerRound = rounds.map((r, i) => ({
    round: `Round ${i + 1}`,
    funding: Math.round(r.snapshot?.total_funding_deployed || 0),
    sentiment: Math.round(r.snapshot?.avg_success_probability || 0),
    marketSentiment: Math.round(r.market_event?.market_sentiment || 50),
  }));

  const roiData = investors.map(inv => ({
    name: inv.name,
    invested: Math.round(inv.total_invested),
    returns: Math.round(inv.total_returns || 0),
    roi: inv.roi,
  }));

  const lastRound = rounds[rounds.length - 1];
  const riskAssessments = lastRound?.risk_assessments || [];
  const riskCategories = ['financial', 'market', 'team', 'competition', 'execution'];

  // Startup success data for bar chart
  const startupBarData = startups.map(s => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + '..' : s.name,
    fullName: s.name,
    success: Math.round(s.success_probability),
    funding: Math.round((s.funding_received || 0) / 1000),
    status: s.status,
  }));

  // Status pie data
  const statusCounts = {};
  startups.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Pipeline steps
  const pipelineSteps = [
    { icon: Rocket, label: 'Step 1', description: 'Startup enters system', color: 'blue-500' },
    { icon: Activity, label: 'Step 2', description: 'Market updates trends', color: 'purple-500' },
    { icon: Shield, label: 'Step 3', description: 'Risk score calculated', color: 'orange-500' },
    { icon: Target, label: 'Step 4', description: 'Investor evaluates', color: 'green-500' },
    { icon: DollarSign, label: 'Step 5', description: 'Investment decision', color: 'yellow-500' },
    { icon: TrendingUp, label: 'Step 6', description: 'Growth simulated', color: 'cyan-500' },
    { icon: CheckCircle, label: 'Step 7', description: 'Success predicted', color: 'emerald-500' },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">Simulation Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentSimulation?.name || 'Latest'} — {summary.market_final_condition || 'N/A'} market
          </p>
        </div>
        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Simulation Completed
        </Badge>
      </div>

      {/* ===== AGENT PIPELINE FLOW ===== */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" /> Multi-Agent System Pipeline
          </CardTitle>
          <p className="text-xs text-muted-foreground">How all 4 agents interact dynamically each round</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {pipelineSteps.map((step, i) => (
              <PipelineStep
                key={i}
                {...step}
                isActive={i <= activeStep}
                delay={i * 100}
              />
            ))}
          </div>
          {/* Connection arrows */}
          <div className="flex justify-between px-8 mt-2">
            {[0,1,2,3,4,5].map(i => (
              <ArrowRight key={i} className={`h-4 w-4 ${i <= activeStep - 1 ? 'text-primary' : 'text-muted-foreground/30'} transition-colors`} />
            ))}
          </div>
        </CardContent>
      </Card>


      {/* ===== ROW: MARKET SENTIMENT + SUCCESS PROBABILITY ===== */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-purple-500" /> Market Sentiment & Success Rate Over Rounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fundingPerRound}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="round" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="marketSentiment" stroke="#8b5cf6" strokeWidth={2} name="Market Sentiment" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="sentiment" stroke="#22c55e" strokeWidth={2} name="Avg Success %" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== RISK HEATMAP ===== */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-orange-500" /> Risk Heatmap (Final Round)
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded bg-green-500/50 mr-1 align-middle" /> Low (&lt;30)
            <span className="inline-block w-3 h-3 rounded bg-yellow-500/60 mx-1 ml-3 align-middle" /> Medium (30-50)
            <span className="inline-block w-3 h-3 rounded bg-orange-500/70 mx-1 ml-3 align-middle" /> High (50-70)
            <span className="inline-block w-3 h-3 rounded bg-red-500/80 mx-1 ml-3 align-middle" /> Critical (&gt;70)
          </p>
        </CardHeader>
        <CardContent>
          {riskAssessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left p-2 font-medium">Startup</th>
                    {riskCategories.map(cat => (
                      <th key={cat} className="p-2 font-medium text-center capitalize">{cat}</th>
                    ))}
                    <th className="p-2 font-medium text-center">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {riskAssessments.map((r, i) => (
                    <tr key={i} className="border-t border-border/20">
                      <td className="p-2 font-medium text-sm">{r.startup}</td>
                      {riskCategories.map(cat => (
                        <td key={cat} className="p-1">
                          <RiskCell value={r.breakdown?.[`${cat}_risk`] || 0} label={cat} />
                        </td>
                      ))}
                      <td className="p-1">
                        <RiskCell value={r.overall_risk} label="Overall" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No risk data</p>
          )}
        </CardContent>
      </Card>

      {/* ===== STARTUP RANKING ===== */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-yellow-500" /> Startup Ranking — Success Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, startups.length * 50)}>
            <BarChart data={startupBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis dataKey="name" type="category" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => [`${value}${name === 'success' ? '%' : 'K'}`, name === 'success' ? 'Success %' : 'Funding ($K)']}
              />
              <Bar dataKey="success" fill="#3b82f6" name="Success %" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== DETAILED STARTUP CARDS ===== */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-blue-500" /> All Startups — Detailed View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {startups.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/30 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.industry}</p>
                    </div>
                  </div>
                  <Badge variant={s.status === 'unicorn' ? 'default' : s.status === 'failed' ? 'destructive' : 'secondary'}>
                    {s.status}
                  </Badge>
                </div>
                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Success</p>
                    <p className="font-bold text-green-500">{s.success_probability}%</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Funding</p>
                    <p className="font-bold text-blue-500">{fmt(s.funding_received || 0)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Idea Quality</p>
                    <p className="font-bold">{Math.round(s.idea_quality)}/100</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Team</p>
                    <p className="font-bold">{Math.round(s.team_strength)}/100</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Runway</p>
                    <p className="font-bold">{s.runway_months || 0} mo</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-muted-foreground">Market Demand</p>
                    <p className="font-bold">{Math.round(s.market_demand)}/100</p>
                  </div>
                </div>
                {/* Success bar */}
                <div className="w-full bg-muted/40 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      s.success_probability >= 70 ? 'bg-green-500' :
                      s.success_probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${s.success_probability}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== INVESTOR PERFORMANCE ===== */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-green-500" /> Investor Decisions & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {investors.map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/20">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-muted-foreground">#{i + 1}</span>
                  <div>
                    <p className="font-semibold">{inv.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.strategy} / {inv.investor_type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Portfolio: {(inv.portfolio || []).filter((v, j, a) => a.indexOf(v) === j).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className={`text-lg font-bold ${inv.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {inv.roi >= 0 ? '+' : ''}{inv.roi}% ROI
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invested: {fmt(inv.total_invested)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Budget left: {fmt(inv.remaining_budget || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
