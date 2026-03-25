import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import RoleSelectPage from "@/pages/RoleSelectPage";
import SimulationSetupPage from "@/pages/SimulationSetupPage";
import DashboardLayout from "@/components/DashboardLayout";
import SimulationDashboard from "@/pages/SimulationDashboard";
import AgentConfigPage from "@/pages/AgentConfigPage";
import FundingRoundsPage from "@/pages/FundingRoundsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AgentInsightsPage from "@/pages/AgentInsightsPage";
import SimulationHistoryPage from "@/pages/SimulationHistoryPage";
import SettingsPage from "@/pages/SettingsPage";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return children;
}

// Redirect if already logged in
function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (!user?.role) return <Navigate to="/role-select" />;
    return <Navigate to="/setup" />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/role-select" element={<ProtectedRoute><RoleSelectPage /></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><SimulationSetupPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SimulationDashboard />} />
        <Route path="agents" element={<AgentConfigPage />} />
        <Route path="funding-rounds" element={<FundingRoundsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="insights" element={<AgentInsightsPage />} />
        <Route path="history" element={<SimulationHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
