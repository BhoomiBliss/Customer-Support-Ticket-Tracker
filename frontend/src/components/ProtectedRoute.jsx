// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Route protection wrapper. Restricts access to authenticated users only.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // If AuthContext is still performing disk reads, show the custom loader
  if (loading) {
    return (
      <div className="h-screen w-screen bg-darkBg flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Redirect to login if user object is not established
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
