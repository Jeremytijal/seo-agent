import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AuditSEO from './pages/AuditSEO';
import Keywords from './pages/Keywords';
import Contents from './pages/Contents';
import ImagesAI from './pages/ImagesAI';
import Publish from './pages/Publish';
import Integrations from './pages/Integrations';
import AgentSettings from './pages/AgentSettings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import LandingPage from './pages/LandingPage';
import Subscription from './pages/Subscription';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/subscription" element={<Subscription />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="audit" element={<AuditSEO />} />
              <Route path="keywords" element={<Keywords />} />
              <Route path="contents" element={<Contents />} />
              <Route path="images" element={<ImagesAI />} />
              <Route path="publish" element={<Publish />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="settings" element={<AgentSettings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
