import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Brain, Rocket, TrendingUp, Shield, Zap, DollarSign, Target, AlertTriangle,
  Flame, Clock, Users, BarChart3, ArrowLeft, Mail, Send, CheckCircle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000').trim().replace(/\/+$/, '')}/api`;

// ==================== STARTUP FOUNDER FORM ====================
function StartupFounderForm({ onRun, loading }) {
  const [config, setConfig] = useState({
    description: '',
    industry: 'tech',
    startup_name: '',
    revenue_projection: 500000,
    burn_rate: 80000,
    runway_months: 12,
    funding_ask: 2000000,
    equity_offered: 15,
    github_username: '',
    linkedin_url: '',
  });

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!config.startup_name.trim()) { toast.error('Enter your startup name'); return; }

    // Register the startup in the backend so investors can see it
    try {
      const token = sessionStorage.getItem('nexvest_token') || '';
      await axios.post(`${API}/startups/register?token=${token}`, {
        name: config.startup_name,
        industry: config.industry,
        revenue_projection: config.revenue_projection,
        burn_rate: config.burn_rate,
        runway_months: config.runway_months,
        funding_ask: config.funding_ask,
        equity_offered: config.equity_offered,
        description: config.description,
        github_username: config.github_username || null,
        linkedin_url: config.linkedin_url || null,
      });
    } catch { /* continue even if registration fails */ }

    const payload = {
      name: config.startup_name,
      description: config.description,
      num_startups: 5,
      num_investors: 3,
      num_rounds: 5,
      market_condition: 'neutral',
      industry: config.industry,
      startups: [{
        name: config.startup_name,
        industry: config.industry,
        revenue_projection: config.revenue_projection,
        burn_rate: config.burn_rate,
        funding_ask: config.funding_ask,
        equity_offered: config.equity_offered,
        runway_months: config.runway_months,
      }],
    };
    onRun(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Rocket className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans']">Startup Founder Mode</h2>
          <p className="text-sm text-muted-foreground">Configure your startup and enter the funding arena</p>
        </div>
      </div>

      {/* Simulation basics */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Simulation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Startup Name</Label>
            <Input placeholder="e.g., NovaPay" value={config.startup_name} onChange={e => update('startup_name', e.target.value)} />
          </div>
          <div>
            <Label>Startup Description</Label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
              placeholder="Describe what your startup does, the problem it solves, and your unique value proposition..."
              value={config.description}
              onChange={e => update('description', e.target.value)}
            />
          </div>
          <div>
            <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> GitHub Username</Label>
            <Input
              placeholder="e.g., johndoe (your GitHub username for Trust Score)"
              value={config.github_username}
              onChange={e => update('github_username', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">AI agents will analyze your GitHub profile to compute a Trust Score</p>
          </div>
          <div>
            <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> LinkedIn Profile URL</Label>
            <Input
              placeholder="e.g., https://linkedin.com/in/johndoe"
              value={config.linkedin_url}
              onChange={e => update('linkedin_url', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Investors will see this link on your startup profile</p>
          </div>
          <div>
            <div>
              <Label>Industry</Label>
              <Select value={config.industry} onValueChange={v => update('industry', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">General Tech</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthtech">Healthtech</SelectItem>
                  <SelectItem value="edtech">Edtech</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="ai_ml">AI / ML</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="greentech">Green Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Startup Parameters */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" /> Your Startup Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Financial Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-green-500" /> Revenue Projection (monthly at 12mo)</Label>
              <Input type="number" value={config.revenue_projection} onChange={e => update('revenue_projection', Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">Projected monthly revenue at 12 months</p>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-1"><Flame className="h-4 w-4 text-red-500" /> Burn Rate (per month)</Label>
              <Input type="number" value={config.burn_rate} onChange={e => update('burn_rate', Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">Monthly cash spend — high burn = red flag</p>
            </div>
          </div>

          {/* Runway */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" /> Current Runway</Label>
              <Badge variant={config.runway_months < 6 ? 'destructive' : config.runway_months > 18 ? 'default' : 'secondary'} className="text-sm font-bold">
                {config.runway_months} months
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {config.runway_months < 6 ? 'Urgent — will accept lower valuation' : config.runway_months > 18 ? 'Strong position — can negotiate' : 'Moderate runway'}
            </p>
            <Slider value={[config.runway_months]} onValueChange={([v]) => update('runway_months', v)} min={1} max={36} step={1} />
          </div>

          <Separator />

          {/* Funding Ask */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-primary" /> Funding Ask Amount</Label>
              <Input type="number" value={config.funding_ask} onChange={e => update('funding_ask', Number(e.target.value))} />
              <p className="text-xs text-muted-foreground mt-1">Total funding you're seeking this round</p>
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-primary" /> Equity Offered: {config.equity_offered}%</Label>
              <Slider value={[config.equity_offered]} onValueChange={([v]) => update('equity_offered', v)} min={1} max={50} step={1} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-1">Percentage equity on the table</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Agent Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Rocket, label: 'Your Startup + 4 AI', count: '1+4', color: 'text-blue-500' },
          { icon: TrendingUp, label: 'AI Investors', count: 3, color: 'text-green-500' },
          { icon: Shield, label: 'Risk Agent', count: 1, color: 'text-orange-500' },
          { icon: Brain, label: 'Market Agent', count: 1, color: 'text-purple-500' },
        ].map((a, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-muted/50 border border-border/30">
            <a.icon className={`h-6 w-6 mx-auto mb-1 ${a.color}`} />
            <p className="text-xl font-bold">{a.count}</p>
            <p className="text-xs text-muted-foreground">{a.label}</p>
          </div>
        ))}
      </div>

      <Button className="w-full btn-primary py-6 text-lg" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Running Simulation...
          </span>
        ) : 'Launch Simulation'}
      </Button>
    </div>
  );
}


// ==================== INVESTOR VIEW — Browse & Analyze Startups ====================
function ConnectCard({ startup }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const token = sessionStorage.getItem('nexvest_token') || '';
      await axios.post(`${API}/interests?token=${token}`, {
        startup_id: startup.id,
        message: message || 'Interested in investing',
      });
      setSent(true);
      toast.success('Interest sent to founder!');
    } catch (e) {
      toast.error('Failed to send interest');
    }
    setSending(false);
  };

  return (
    <Card className="glass-card border-green-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-green-500" /> Connect with Founder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">{startup.founder_name}</p>
            {startup.founder_email && (
              <a href={`mailto:${startup.founder_email}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> {startup.founder_email}
              </a>
            )}
            {startup.linkedin_url && (
              <a href={startup.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn Profile
              </a>
            )}
          </div>
          <div className="space-y-2">
            {sent ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Interest Sent!</p>
                  <p className="text-xs text-muted-foreground">The founder will be notified</p>
                </div>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Write a message to the founder (optional)..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <Button onClick={handleSend} disabled={sending} className="w-full bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Express Interest'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorView() {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch registered startups
  useEffect(() => {
    axios.get(`${API}/startups`).then(res => {
      setStartups(res.data || []);
    }).catch(() => {
      toast.error('Failed to load startups');
    }).finally(() => setLoadingList(false));
  }, []);

  const handleAnalyze = async (startup) => {
    setSelectedStartup(startup);
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const res = await axios.get(`${API}/startups/${startup.id}/analyze`);
      setAnalysis(res.data);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const industryLabels = {
    tech: 'General Tech', fintech: 'Fintech', healthtech: 'Healthtech',
    edtech: 'Edtech', saas: 'SaaS', ai_ml: 'AI / ML',
    ecommerce: 'E-Commerce', cybersecurity: 'Cybersecurity', greentech: 'Green Tech',
  };

  const riskColor = (score) => score < 35 ? 'text-green-500' : score < 60 ? 'text-yellow-500' : 'text-red-500';
  const verdictLabel = { strong_invest: 'Strong Invest', invest: 'Invest', risky: 'Risky', pass: 'Pass' };
  const verdictColor = { strong_invest: 'bg-green-500/20 text-green-400', invest: 'bg-blue-500/20 text-blue-400', risky: 'bg-yellow-500/20 text-yellow-400', pass: 'bg-red-500/20 text-red-400' };

  // ---- Analysis Detail View ----
  if (selectedStartup && (analyzing || analysis)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedStartup(null); setAnalysis(null); }} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Startups
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Rocket className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans']">{selectedStartup.name}</h2>
            <p className="text-sm text-muted-foreground">{industryLabels[selectedStartup.industry] || selectedStartup.industry} — Founded by {selectedStartup.founder_name}</p>
            {selectedStartup.linkedin_url && (
              <a href={selectedStartup.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">AI Agents analyzing startup...</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Market Agent</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Risk Agent</span>
              <span className="flex items-center gap-1"><Brain className="h-3 w-3" /> Investor Agent</span>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-5">
            {/* Verdict Banner */}
            <div className={`rounded-xl p-4 flex items-center justify-between ${verdictColor[analysis.verdict]}`}>
              <div>
                <p className="text-lg font-bold">{verdictLabel[analysis.verdict]}</p>
                <p className="text-sm opacity-80">{analysis.funded_by} of {analysis.total_investors} AI investors would fund this startup</p>
              </div>
              <Badge className={`text-lg px-4 py-1 ${verdictColor[analysis.verdict]}`}>{analysis.funded_by}/{analysis.total_investors}</Badge>
            </div>

            {/* Startup Profile Summary */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Startup Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-xl font-bold">{selectedStartup.idea_quality / 10}/10</p>
                    <p className="text-xs text-muted-foreground">Idea Quality</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{selectedStartup.market_demand / 10}/10</p>
                    <p className="text-xs text-muted-foreground">Market Demand</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Users className="h-5 w-5 mx-auto mb-1 text-cyan-500" />
                    <p className="text-xl font-bold">{selectedStartup.team_strength}%</p>
                    <p className="text-xs text-muted-foreground">Team Strength</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-xl font-bold">{selectedStartup.runway_months}mo</p>
                    <p className="text-xs text-muted-foreground">Runway</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">${(selectedStartup.funding_ask || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Funding Ask</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Flame className="h-5 w-5 mx-auto mb-1 text-red-500" />
                    <p className="text-lg font-bold">${(selectedStartup.burn_rate || 0).toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground">Burn Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold">{selectedStartup.equity_offered}%</p>
                    <p className="text-xs text-muted-foreground">Equity Offered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Trust Score */}
            {selectedStartup.github_username && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> GitHub Trust Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-4">
                    {selectedStartup.github_data?.avatar_url && (
                      <img src={selectedStartup.github_data.avatar_url} alt="" className="h-16 w-16 rounded-full border-2 border-border" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-lg">@{selectedStartup.github_username}</p>
                        <Badge className={`text-lg px-3 py-0.5 ${
                          selectedStartup.trust_score >= 75 ? 'bg-green-500/20 text-green-400' :
                          selectedStartup.trust_score >= 50 ? 'bg-blue-500/20 text-blue-400' :
                          selectedStartup.trust_score >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedStartup.trust_score}/100
                        </Badge>
                      </div>
                      {selectedStartup.github_data?.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedStartup.github_data.bio}</p>
                      )}
                    </div>
                  </div>

                  {selectedStartup.github_data && (
                    <>
                      <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">GitHub Summary</p>
                        {[
                          { label: 'Account Created', value: selectedStartup.github_data.account_created ? `${new Date(selectedStartup.github_data.account_created).getFullYear()} (${Math.floor((Date.now() - new Date(selectedStartup.github_data.account_created).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years ago)` : '—' },
                          { label: 'Number of Repositories', value: selectedStartup.github_data.public_repos },
                          { label: 'Followers', value: selectedStartup.github_data.followers },
                          { label: 'Following', value: selectedStartup.github_data.following },
                          { label: 'Total Stars Earned', value: selectedStartup.github_data.total_stars },
                          { label: 'Total Forks', value: selectedStartup.github_data.total_forks },
                          { label: 'Repos Active This Year', value: selectedStartup.github_data.recent_repos_count },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-bold text-foreground">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      {selectedStartup.github_data.languages?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Tech Stack</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedStartup.github_data.languages.map((lang, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedStartup.github_data.top_repos?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Top Repositories</p>
                          <div className="space-y-2">
                            {selectedStartup.github_data.top_repos.map((repo, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div>
                                  <p className="text-sm font-medium">{repo.name}</p>
                                  {repo.description && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{repo.description}</p>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {repo.language && <Badge variant="secondary" className="text-xs">{repo.language}</Badge>}
                                  <span>★ {repo.stars}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedStartup.trust_reasons?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Trust Analysis</p>
                      {selectedStartup.trust_reasons.map((reason, i) => (
                        <p key={i} className={`text-xs ${i === 0 ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {i === 0 ? reason : `• ${reason}`}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!selectedStartup.github_username && (
              <Card className="glass-card">
                <CardContent className="py-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No GitHub profile linked — Trust Score unavailable</p>
                </CardContent>
              </Card>
            )}

            {/* Risk Analysis */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-orange-500" /> Risk Agent Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Risk Score</span>
                  <span className={`text-2xl font-bold ${riskColor(analysis.risk_analysis.overall_risk)}`}>
                    {analysis.risk_analysis.overall_risk.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failure Probability</span>
                  <span className={`text-lg font-semibold ${riskColor(analysis.risk_analysis.failure_probability)}`}>
                    {analysis.risk_analysis.failure_probability.toFixed(1)}%
                  </span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(analysis.risk_analysis.breakdown).map(([key, val]) => (
                    <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                      <p className={`text-lg font-bold ${riskColor(val)}`}>{val.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
                {analysis.risk_analysis.recommendations?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Recommendations:</p>
                    {analysis.risk_analysis.recommendations.map((rec, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {rec}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Market Agent Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Market Event</p>
                    <p className="text-sm font-semibold mt-1">{analysis.market_analysis.market_event.description}</p>
                    <Badge className="mt-2" variant="secondary">{analysis.market_analysis.market_event.event_type}</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Industry Score</p>
                    <p className={`text-3xl font-bold mt-1 ${analysis.market_analysis.industry_score > 60 ? 'text-green-500' : analysis.market_analysis.industry_score < 40 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {analysis.market_analysis.industry_score}/100
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Impact: {analysis.market_analysis.market_event.impact_score > 0 ? '+' : ''}{analysis.market_analysis.market_event.impact_score.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Evaluations */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-purple-500" /> Investor Agent Decisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.investor_evaluations.map((ev, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${ev.decision === 'funded' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{ev.investor_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{ev.investor_strategy} strategy</p>
                      </div>
                      <Badge variant={ev.decision === 'funded' ? 'default' : 'destructive'}>
                        {ev.decision === 'funded' ? 'INVEST' : 'PASS'}
                      </Badge>
                    </div>
                    {ev.decision === 'funded' && (
                      <div className="flex gap-4 text-sm mb-2">
                        <span className="text-green-500 font-semibold">${ev.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">for {ev.equity_percentage}% equity</span>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Score: {ev.attractiveness_score} / {ev.threshold} threshold</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ev.reasoning}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Connect with Founder */}
            <ConnectCard startup={selectedStartup} />
          </div>
        ) : null}
      </div>
    );
  }

  // ---- Startup List View ----
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-green-500/20">
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-['Plus_Jakarta_Sans']">Investor Mode</h2>
          <p className="text-sm text-muted-foreground">Browse registered startups and run AI analysis</p>
        </div>
      </div>

      {loadingList ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : startups.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Startups Registered Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Startup founders need to register their startups first before investors can analyze them.</p>
            <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{startups.length} startup{startups.length !== 1 ? 's' : ''} available for analysis</p>
          {startups.map(s => (
            <Card key={s.id} className="glass-card hover:border-primary/50 transition-all cursor-pointer" onClick={() => handleAnalyze(s)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Rocket className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{industryLabels[s.industry] || s.industry} — by {s.founder_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-500">${(s.funding_ask || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">seeking funding</p>
                    </div>
                    <Badge variant="secondary">{s.idea_quality / 10}/10</Badge>
                    {s.trust_score > 0 && (
                      <Badge className={`${s.trust_score >= 75 ? 'bg-green-500/20 text-green-400' : s.trust_score >= 50 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        Trust: {s.trust_score}
                      </Badge>
                    )}
                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Team: {s.team_strength}%</span>
                  <span>Runway: {s.runway_months}mo</span>
                  <span>Burn: ${(s.burn_rate || 0).toLocaleString()}/mo</span>
                  <span>Equity: {s.equity_offered}%</span>
                  <span className="capitalize">Competition: {s.competition_level}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// ==================== MAIN SETUP PAGE ====================
export default function SimulationSetupPage() {
  const { user, getAuthHeaders, refreshSimulations } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const role = user?.role;

  const handleRun = async (payload) => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      await axios.post(`${API}/simulations`, payload, { headers });
      toast.success('Simulation completed!');
      await refreshSimulations();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-3xl mx-auto fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">New Simulation</h1>
            <p className="text-sm text-muted-foreground">
              {role === 'investor' ? 'Configure your investment criteria' : 'Configure your startup profile'}
            </p>
          </div>
        </div>

        {role === 'investor' ? (
          <InvestorView />
        ) : (
          <StartupFounderForm onRun={handleRun} loading={loading} />
        )}
      </div>
    </div>
  );
}
