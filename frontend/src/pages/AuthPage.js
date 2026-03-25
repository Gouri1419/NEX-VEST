import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

export default function AuthPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    if (isSignUp && !form.full_name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await axios.post(`${API}/auth/signup`, form);
        authLogin(res.data.token, res.data.user);
        toast.success('Account created!');
        navigate('/role-select');
      } else {
        const res = await axios.post(`${API}/auth/login`, { email: form.email, password: form.password });
        authLogin(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.full_name}!`);
        if (!res.data.user.role) {
          navigate('/role-select');
        } else {
          navigate('/setup');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">NexVest</h1>
          <p className="text-muted-foreground mt-2">Multi-Agent Startup Investment Simulator</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {isSignUp ? <UserPlus className="h-5 w-5 text-primary" /> : <LogIn className="h-5 w-5 text-primary" />}
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label>Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isSignUp ? 'Min 6 characters' : 'Enter password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full btn-primary py-5" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {isSignUp ? 'Creating account...' : 'Logging in...'}
                  </span>
                ) : isSignUp ? 'Create Account' : 'Login'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
