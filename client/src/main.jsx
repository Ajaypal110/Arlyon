import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Landing from './pages/public/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Onboarding from './pages/auth/Onboarding';
import Dashboard from './pages/app/Dashboard';
import Discover from './pages/app/Discover';
import Matches from './pages/app/Matches';
import Chat from './pages/app/Chat';
import Profile from './pages/app/Profile';
import Settings from './pages/app/Settings';
import Premium from './pages/app/Premium';
import Notifications from './pages/app/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';

// Policy Pages
import PrivacyPolicy from './pages/public/policies/PrivacyPolicy';
import TermsOfService from './pages/public/policies/TermsOfService';
import RefundPolicy from './pages/public/policies/RefundPolicy';
import ContactUs from './pages/public/policies/ContactUs';

import { GoogleOAuthProvider } from '@react-oauth/google';
import './lib/firebase'; // Initialize Firebase

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  
                  {/* Policies */}
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/contact" element={<ContactUs />} />

                  {/* App */}
                  <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="matches" element={<Matches />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="premium" element={<Premium />} />
                    <Route path="notifications" element={<Notifications />} />
                  </Route>

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </CallProvider>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1E293B',
                  color: '#F1F5F9',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
