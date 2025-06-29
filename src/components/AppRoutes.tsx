import React from 'react';
import {useLocation,  Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Appointments from '../pages/Appointments';
import BookAppointment from '../pages/BookAppointment';
import MedicalRecords from '../pages/MedicalRecords';
import MedicalRecordDetail from '../pages/MedicalRecordDetail';
import Doctors from '../pages/Doctors';
import DoctorProfile from '../pages/DoctorProfile';
import Profile from '../pages/Profile';
import ProfileSettings from '../pages/ProfileSettings';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Welcome from '../pages/auth/welcome';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import MainLayout from './layouts/MainLayout';
import Notifications from '../pages/Notifications';
import Medications from '../pages/Medications';
import Help from '../pages/Help';
import AuthLayout from './layouts/AuthLayout';
import { useAuthStore } from '@/lib/store';
import PrivacyPolicy from '../pages/privacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import CookiePolicy from '../pages/CookiePolicy';
import Vitals from '../pages/Vitals';
import Reminders from '../pages/Reminders';
import NotFound from '../pages/NotFound';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // Only redirect logged-in users if they access auth-related pages
  const publicPaths = ['/login', '/register', '/forgotpassword', '/resetpassword'];
  if (user && publicPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const user = useAuthStore((state) => state.user);
  return (
    <Routes>
      {/* Auth Routes - Only accessible when not logged in */}
      <Route element={<AuthLayout />}>

        <Route path="/welcome" element={
          <PublicRoute>
            <Welcome/>
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgotpassword" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/resetpassword" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />
      </Route>

      {/* Protected Routes - Only accessible when logged in */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/appointments/book" element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/medical-records" element={
          <ProtectedRoute>
            <MedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/medical-records/:id" element={
          <ProtectedRoute>
            <MedicalRecordDetail />
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        } />
        <Route path="/doctors/:id" element={
          <ProtectedRoute>
            <DoctorProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/vitals" element={
          <ProtectedRoute>
            <Vitals />
          </ProtectedRoute>
        } />
        <Route path="/reminders" element={
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      </Route>
  
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    
    </Routes>
  );
}

export default AppRoutes;