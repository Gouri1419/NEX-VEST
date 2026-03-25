import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Bot, Brain, TrendingUp, Shield, Zap, BarChart3, Moon, Sun } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const features = [
    { icon: Bot, title: 'Multi-Agent System', desc: '4 intelligent AI agents interact autonomously — Startup, Investor, Risk, and Market agents making real-time decisions.' },
    { icon: Brain, title: 'ML Prediction', desc: 'Machine learning models predict startup success probability based on team strength, market demand, and financials.' },
    { icon: TrendingUp, title: 'Funding Simulation', desc: 'Watch multi-round funding simulations where investors compete to fund the best startups.' },
    { icon: Shield, title: 'Risk Analysis', desc: 'Comprehensive risk evaluation with financial, market, team, competition, and execution risk breakdowns.' },
    { icon: Zap, title: 'Market Dynamics', desc: 'Dynamic market events — booms, crashes, regulations, innovations — that impact all agent decisions.' },
    { icon: BarChart3, title: 'Rich Analytics', desc: 'ROI charts, risk heatmaps, funding flow visualizations, and startup rankings in real-time.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-['Plus_Jakarta_Sans']">NexVest</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')}>Login</Button>
          <Button className="btn-primary px-6" onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-4xl mx-auto fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
          <Bot className="h-4 w-4" />
          Multi-Agent AI Simulation Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight leading-tight mb-6">
          Simulate the <span className="text-primary">Startup Ecosystem</span> with AI Agents
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-10">
          A web-based intelligent simulation where multiple AI agents act like startups and investors,
          interact with each other, and predict funding outcomes and startup success — all autonomously.
        </p>
        <div className="flex gap-4">
          <Button className="btn-primary px-8 py-6 text-lg" onClick={() => navigate('/auth')}>
            Launch Simulator
          </Button>
          <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            See How It Works
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-center mb-4">How the Simulation Works</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Each simulation runs through multiple funding rounds where 4 AI agents interact dynamically.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Configure', desc: 'Set up startups, investors, market conditions, and number of rounds' },
            { step: '2', title: 'Simulate', desc: 'AI agents interact — market events trigger, risk is evaluated, investors decide' },
            { step: '3', title: 'Analyze', desc: 'View funding flows, risk heatmaps, ROI charts, and agent decision logs' },
            { step: '4', title: 'Compare', desc: 'Re-run with different parameters and compare outcomes side by side' },
          ].map((item) => (
            <Card key={item.step} className="glass-card text-center">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="glass-card hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <f.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* The 4 Agents */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] text-center mb-4">The 4 AI Agents</h2>
        <p className="text-muted-foreground text-center mb-12">Each agent has its own goal and decision-making logic</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: '🚀', name: 'Startup Agent', goal: 'Maximize funding received', desc: 'Represents startup companies with idea quality, team strength, market demand scores. Generates pitches and evolves each round.' },
            { icon: '💰', name: 'Investor Agent', goal: 'Maximize ROI', desc: 'Evaluates startups using scoring algorithms. Supports aggressive, conservative, balanced, and contrarian strategies.' },
            { icon: '🛡️', name: 'Risk Agent', goal: 'Calculate failure probability', desc: 'Analyzes financial, market, team, competition, and execution risk. Uses sigmoid functions for probability estimation.' },
            { icon: '📊', name: 'Market Agent', goal: 'Simulate market dynamics', desc: 'Generates market events (booms, crashes, regulations). Tracks sentiment and influences all other agents.' },
          ].map((agent, i) => (
            <Card key={i} className="glass-card hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-xs text-primary">Goal: {agent.goal}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{agent.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8 text-center text-sm text-muted-foreground">
        <p>NexVest — Multi-Agent Startup Funding & Investment Platform</p>
        <p className="mt-1">Built with React, FastAPI & Multi-Agent AI</p>
      </footer>
    </div>
  );
}
