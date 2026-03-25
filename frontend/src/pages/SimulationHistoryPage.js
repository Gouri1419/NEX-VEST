import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Trash2, Eye, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

export default function SimulationHistoryPage() {
  const { simulations, getAuthHeaders, setCurrentSimulation, refreshSimulations } = useAuth();
  const navigate = useNavigate();

  const handleView = (sim) => {
    setCurrentSimulation(sim);
    navigate('/dashboard');
  };

  const handleDelete = async (simId) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API}/simulations/${simId}`, { headers });
      toast.success('Simulation deleted');
      await refreshSimulations();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const statusColors = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">Simulation History</h1>
          <p className="text-sm text-muted-foreground mt-1">All your past simulations</p>
        </div>
        <Button className="btn-primary" onClick={() => navigate('/setup')}>
          <Zap className="h-4 w-4 mr-2" /> New Simulation
        </Button>
      </div>

      {simulations.length === 0 ? (
        <div className="text-center py-20">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No simulations yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {simulations.map((sim) => (
            <Card key={sim.id} className="glass-card hover:border-primary/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{sim.name}</h3>
                      <Badge className={statusColors[sim.status] || ''}>{sim.status}</Badge>
                    </div>
                    {sim.description && <p className="text-sm text-muted-foreground mb-2">{sim.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{sim.num_startups} startups</span>
                      <span>{sim.num_investors} investors</span>
                      <span>{sim.num_rounds} rounds</span>
                      <span className="capitalize">{sim.market_condition} market</span>
                      <span>{sim.industry}</span>
                      <span>{new Date(sim.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {sim.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => handleView(sim)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(sim.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
