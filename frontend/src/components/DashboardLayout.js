import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart3, Brain, Home, LogOut, Menu, Moon, Settings, Sun, X, Zap, TrendingUp, Shield, History, Bot } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Overview', end: true },
  { to: '/dashboard/agents', icon: Bot, label: 'Agent Config' },
  { to: '/dashboard/funding-rounds', icon: TrendingUp, label: 'Funding Rounds' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/insights', icon: Brain, label: 'Agent Insights' },
  { to: '/dashboard/history', icon: History, label: 'Sim History' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (profile?.full_name || profile?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold font-['Plus_Jakarta_Sans']">NexVest</span>
        </div>
        <Button className="w-full btn-primary" size="sm" onClick={() => { navigate('/setup'); setSidebarOpen(false); }}>
          <Zap className="h-4 w-4 mr-2" /> New Simulation
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/40">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[120px]">{profile?.full_name || profile?.email || 'User'}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { signOut(); navigate('/auth'); }} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 glass-sidebar bg-background z-50 flex flex-col">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-border/40">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">NexVest</span>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
