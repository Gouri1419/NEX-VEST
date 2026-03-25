import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, TrendingUp, Shield, Brain, Bot } from 'lucide-react';

export default function AgentConfigPage() {
  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">AI Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand how each agent makes decisions</p>
      </div>

      <Tabs defaultValue="startup" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="startup" className="flex items-center gap-1"><Rocket className="h-4 w-4" /> Startup</TabsTrigger>
          <TabsTrigger value="investor" className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Investor</TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1"><Shield className="h-4 w-4" /> Risk</TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-1"><Brain className="h-4 w-4" /> Market</TabsTrigger>
        </TabsList>

        {/* Startup Agent */}
        <TabsContent value="startup">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-500" /> Startup Agent
                <Badge className="ml-2">Goal: Maximize Funding</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Parameters" items={[
                  'Idea Quality (0-100) — Innovation strength',
                  'Team Strength (0-100) — Execution capability',
                  'Market Demand (0-100) — Customer need',
                  'Revenue Projection — Estimated annual revenue',
                  'Burn Rate — Monthly cash expenditure',
                ]} />
                <InfoCard title="Behaviors" items={[
                  'Generates funding pitches to investors each round',
                  'Evolves parameters based on market conditions',
                  'Team and idea quality improve over time (learning)',
                  'Fails if runway hits zero with low success probability',
                  'Can achieve "unicorn" status if highly funded + successful',
                ]} />
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-400">Success Formula</p>
                <code className="text-xs text-muted-foreground mt-1 block">
                  success = idea_quality * 0.25 + team_strength * 0.35 + market_demand * 0.25 + runway_factor * 1.0
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investor Agent */}
        <TabsContent value="investor">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" /> Investor Agent
                <Badge className="ml-2">Goal: Maximize ROI</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Parameters" items={[
                  'Budget — Total capital available',
                  'Risk Tolerance (0-100) — How much risk accepted',
                  'Strategy — Aggressive / Conservative / Balanced / Contrarian',
                  'Type — Angel / VC / PE / Accelerator',
                  'Preferred Industry — Optional focus area',
                ]} />
                <InfoCard title="Decision Logic" items={[
                  'Scores each startup on attractiveness (0-100)',
                  'Aggressive: favors high-growth, lower threshold (45)',
                  'Conservative: favors low-risk, higher threshold (65)',
                  'Contrarian: seeks undervalued "hidden gems"',
                  'Never puts more than 35% of budget in one startup',
                ]} />
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-400">Investment Score Formula</p>
                <code className="text-xs text-muted-foreground mt-1 block">
                  score = idea * 0.20 + team * 0.30 + demand * 0.25 + market * 0.15 + safety * 0.10 + strategy_modifier
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Agent */}
        <TabsContent value="risk">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-orange-500" /> Risk Evaluation Agent
                <Badge className="ml-2">Goal: Calculate Failure Probability</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Risk Categories" items={[
                  'Financial Risk (30%) — Runway, burn rate, revenue ratio',
                  'Market Risk (25%) — Demand + market conditions',
                  'Team Risk (20%) — Inverse of team strength',
                  'Competition Risk (15%) — Industry saturation',
                  'Execution Risk (10%) — Team + idea ability to deliver',
                ]} />
                <InfoCard title="How It Works" items={[
                  'Evaluates each startup every funding round',
                  'Uses sigmoid function for failure probability',
                  'Generates risk level labels: low / moderate / high / critical',
                  'Provides mitigation recommendations',
                  'Risk history tracked across all rounds',
                ]} />
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm font-medium text-orange-400">Failure Probability (Sigmoid)</p>
                <code className="text-xs text-muted-foreground mt-1 block">
                  P(failure) = 100 / (1 + e^(-(risk - 50) / 15))
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Agent */}
        <TabsContent value="market">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" /> Market Trend Agent
                <Badge className="ml-2">Goal: Simulate Market Dynamics</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard title="Market Events" items={[
                  'Boom — Growth surge (+5 to +20 impact)',
                  'Crash — Market correction (-25 to -8 impact)',
                  'Regulation — Policy changes (-10 to +5)',
                  'Innovation — Tech breakthroughs (+3 to +15)',
                  'Competition — Market saturation (-12 to -2)',
                  'Stable — Steady conditions (-3 to +3)',
                ]} />
                <InfoCard title="Behavior" items={[
                  'Generates one event per funding round',
                  'Event probabilities shift based on current sentiment',
                  'Bull markets: more booms, less crashes',
                  'Bear markets: more crashes, slower recovery',
                  'Tracks sentiment (0-100) across all rounds',
                  'Different industries have different growth rates',
                ]} />
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm font-medium text-purple-400">Industry Growth Rates</p>
                <code className="text-xs text-muted-foreground mt-1 block">
                  AI/ML: 20% | Greentech: 18% | Healthtech: 15% | Cybersecurity: 14% | Fintech: 12% | SaaS: 10%
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
      <p className="font-semibold text-sm mb-3">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-0.5">-</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
