import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getRoleRedirectPath(role) {
  switch (role) {
    case 'owner': return '/hotel-owner-dashboard';
    case 'admin': return '/admin-dashboard';
    case 'traveler':
    default: return '/home';
  }
}

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div className="spinner" style={{
          width: 40,
          height: 40,
          border: '4px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = allowedRoles
    ? allowedRoles.includes(user.role)
    : requiredRole
      ? user.role === requiredRole
      : true;

  if (!hasRole) {
    return <Navigate to={getRoleRedirectPath(user.role)} replace />;
  }

  return children;
}
