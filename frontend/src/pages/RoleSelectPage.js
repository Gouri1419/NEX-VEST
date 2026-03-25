import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { token, updateUser } = useAuth();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'startup_founder',
      icon: Rocket,
      title: 'Startup Founder',
      description: 'Enter your startup details — idea quality, burn rate, revenue projections, funding ask — and see how AI investors evaluate your pitch.',
      features: ['Set idea quality & market demand', 'Define burn rate & runway', 'Request funding with equity offer', 'Watch investors decide in real-time'],
      color: 'blue',
    },
    {
      id: 'investor',
      icon: TrendingUp,
      title: 'Investor',
      description: 'Configure your investment criteria — risk tolerance, minimum scores, target ROI — and watch AI startups pitch to you across funding rounds.',
      features: ['Set minimum idea quality threshold', 'Define risk tolerance ceiling', 'Configure target ROI multiplier', 'Evaluate startups automatically'],
      color: 'green',
    },
  ];

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Please select a role');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/role`, { token, role: selected });
      updateUser(res.data.user);
      toast.success(`You're in as ${selected === 'startup_founder' ? 'Startup Founder' : 'Investor'}!`);
      navigate('/setup');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-3xl fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">Choose Your Role</h1>
          <p className="text-muted-foreground mt-2">How do you want to participate in the simulation?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {roles.map(role => (
            <Card
              key={role.id}
              className={`glass-card cursor-pointer transition-all duration-300 ${
                selected === role.id
                  ? `border-${role.color}-500 ring-2 ring-${role.color}-500/30 bg-${role.color}-500/5`
                  : 'hover:border-border/60'
              }`}
              onClick={() => setSelected(role.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${selected === role.id ? `bg-${role.color}-500/20` : 'bg-muted/50'}`}>
                    <role.icon className={`h-7 w-7 ${selected === role.id ? `text-${role.color}-500` : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans']">{role.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className={`h-1.5 w-1.5 rounded-full ${selected === role.id ? `bg-${role.color}-500` : 'bg-muted-foreground/50'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {selected === role.id && (
                  <div className={`mt-4 text-center text-sm font-semibold text-${role.color}-500`}>
                    Selected
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            className="btn-primary px-10 py-5 text-lg"
            onClick={handleContinue}
            disabled={!selected || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
