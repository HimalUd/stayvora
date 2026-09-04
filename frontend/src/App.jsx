import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';

import About from './pages/About';
import ContactUs from './pages/ContactUs';
import HotelOwnerPortal from './pages/HotelOwnerPortal';
import HotelOwnerLogin from './pages/HotelOwnerLogin';
import HotelOwnerRegister from './pages/HotelOwnerRegister';
import HotelRegistration from './pages/HotelRegistration';
import EmailVerification from './pages/EmailVerification';
import HotelOwnerDashboard from './pages/HotelOwnerDashboard';
import HotelOwnerBookingDetail from './pages/HotelOwnerBookingDetail';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import UserDashboard from './pages/Dashboard/UserDashboard';
import MyBookingDetail from './pages/MyBookingDetail';
import HotelOwnerReviews from './pages/HotelOwnerReviews';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/hotel-owner-portal" element={<HotelOwnerPortal />} />
      <Route path="/hotel-owner-login" element={<HotelOwnerLogin />} />
      <Route path="/hotel-owner-register" element={<HotelOwnerRegister />} />
      <Route
        path="/email-verification"
        element={
          <ProtectedRoute requiredRole="owner">
            <EmailVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel-owner-dashboard"
        element={
          <ProtectedRoute requiredRole="owner">
            <HotelOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel-registration"
        element={
          <ProtectedRoute requiredRole="owner">
            <HotelRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel-owner-booking/:bookingCode"
        element={
          <ProtectedRoute requiredRole="owner">
            <HotelOwnerBookingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel-owner-reviews"
        element={
          <ProtectedRoute requiredRole="owner">
            <HotelOwnerReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><Home /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotels"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><SearchResults /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><SearchResults /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel/:id"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><HotelDetail /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:hotelId"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><Booking /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirmation"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><Confirmation /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><UserDashboard /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-booking/:bookingCode"
        element={
          <ProtectedRoute requiredRole="traveler">
            <AuthLayout><MyBookingDetail /></AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
