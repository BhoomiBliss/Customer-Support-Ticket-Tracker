// frontend/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import TicketDetails from './pages/TicketDetails';

/**
 * Main Layout wrapper that dynamically mounts the Sidebar for authenticated users.
 */
const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-slate-100 font-sans">
      {/* Top Navigation bar */}
      <Navbar />

      {/* Main viewport area */}
      <div className="flex flex-1 relative">
        {/* Left Side Navigation Panel: Mounted only if a user is logged in */}
        {user && <Sidebar />}

        {/* Content routing slots */}
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Protected Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-ticket"
            element={
              <ProtectedRoute>
                <NewTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            }
          />

          {/* Wildcard Route Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
