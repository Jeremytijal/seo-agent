import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import ContentPlanner from './pages/ContentPlanner';
import AuditSEO from './pages/AuditSEO';
import Keywords from './pages/Keywords';
import Contents from './pages/Contents';
import Publish from './pages/Publish';
import Integrations from './pages/Integrations';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LandingPage from './pages/LandingPage';
import LandingPageRedacteur from './pages/LandingPageRedacteur';
import LandingPageAutomation from './pages/LandingPageAutomation';
import LandingPageTraffic from './pages/LandingPageTraffic';
import LandingPagePrix from './pages/LandingPagePrix';
import FunnelDemoRedacteur from './pages/FunnelDemoRedacteur';
import FunnelDemoThankYou from './pages/FunnelDemoThankYou';
import Subscription from './pages/Subscription';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FunnelLanding from './pages/FunnelLanding';
import FunnelURL from './pages/FunnelURL';
import FunnelAnalyze from './pages/FunnelAnalyze';
import FunnelResults from './pages/FunnelResults';
import FunnelConvert from './pages/FunnelConvert';
import FunnelPayment from './pages/FunnelPayment';
import LandingPageLongVariantB from './pages/LandingPageLongVariantB';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/signup" />;
};

console.log('App.jsx: Rendering App component...');

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/landing/redacteur" element={<LandingPageRedacteur />} />
          <Route path="/landing/redacteur/demo" element={<FunnelDemoRedacteur />} />
          <Route path="/landing/redacteur/merci" element={<FunnelDemoThankYou />} />
          <Route path="/landing/automation" element={<LandingPageAutomation />} />
          <Route path="/landing/traffic" element={<LandingPageTraffic />} />
          <Route path="/landing/prix" element={<LandingPagePrix />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Funnel Routes */}
          <Route path="/funnel" element={<FunnelLanding />} />
          <Route path="/funnel/url" element={<FunnelURL />} />
          <Route path="/funnel/analyze" element={<FunnelAnalyze />} />
          <Route path="/funnel/results" element={<FunnelResults />} />
          <Route path="/funnel/convert" element={<FunnelConvert />} />
          <Route path="/funnel/payment" element={<FunnelPayment />} />
          
          {/* Landing Page Long Variant B */}
          <Route path="/lp-variant-b" element={<LandingPageLongVariantB />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/subscription" element={<Subscription />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="planner" element={<ContentPlanner />} />
              <Route path="audit" element={<AuditSEO />} />
              <Route path="keywords" element={<Keywords />} />
              <Route path="contents" element={<Contents />} />
              <Route path="publish" element={<Publish />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
