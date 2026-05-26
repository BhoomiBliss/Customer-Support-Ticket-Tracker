// frontend/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Ticket, Plus, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between border-b border-slate-800">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-3 text-brandText hover:opacity-90 transition-opacity">
        <div className="bg-brandPrimary/10 p-2 rounded-lg border border-brandPrimary/20">
          <Ticket className="w-5 h-5 text-brandPrimary" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brandPrimary to-brandAccent bg-clip-text text-transparent">
          SupportDesk
        </span>
      </Link>

      {/* User Session Interface */}
      {user && (
        <div className="flex items-center space-x-6">
          {/* User Info Capsule */}
          <div className="flex items-center space-x-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800/80">
            <div className="bg-brandAccent/10 p-1.5 rounded-full">
              <User className="w-4 h-4 text-brandAccent" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-200 leading-none">{user.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                {user.role}
              </span>
            </div>
          </div>

          {/* Context Action Button: Submit Ticket (Customers only) */}
          {user.role === 'customer' && (
            <Link
              to="/new-ticket"
              className="flex items-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Ticket</span>
            </Link>
          )}

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-slate-800/60 hover:bg-brandDanger/10 hover:border-brandDanger/30 text-slate-400 hover:text-brandDanger border border-slate-700/60 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
