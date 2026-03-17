import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import PageTransition from './components/PageTransition';
import AuthLayout from './components/AuthLayout';
import MainLayout from './components/MainLayout';
import Expenses from './pages/Expenses';
import AnalyticsPage from './pages/AnalyticsPage';
import Settings from './pages/Settings';
import { ThemeProvider } from './components/theme-provider';

// Helper to redirect authenticated users away from public pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  // Determine key for AnimatePresence
  // If we are on login or signup, use the same key so they don't animate between each other
  const locationKey = location.pathname === '/login' || location.pathname === '/signup'
    ? 'auth-page'
    : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={locationKey}>
        <Route path="/" element={
          <PublicRoute>
            <PageTransition>
              <LandingPage />
            </PageTransition>
          </PublicRoute>
        } />

        {/* Auth Pages - Wrapped in AuthLayout (Persists layout across login/signup toggle) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          } />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  )
}

export default App;
