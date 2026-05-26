// frontend/src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, User, Ticket } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <aside className="w-64 h-[calc(100vh-73px)] bg-slate-900/40 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
      <div className="flex flex-col space-y-8">
        {/* Workspace Title */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Workspace</h3>
          <p className="text-sm font-medium text-slate-400 mt-1 capitalize">{user.role} Dashboard</p>
        </div>

        {/* Navigation Routes */}
        <nav className="flex flex-col space-y-2">
          {/* Dashboard Route */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary shadow-neonIndigo'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* New Ticket Route (Customers only) */}
          {user.role === 'customer' && (
            <NavLink
              to="/new-ticket"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brandPrimary/10 border border-brandPrimary/20 text-brandPrimary shadow-neonIndigo'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Ticket</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Role Profile Tag */}
      <div className="border-t border-slate-800 pt-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-300 leading-none">{user.name}</span>
            <span className="text-[9px] font-bold text-slate-500 tracking-wider mt-1 uppercase">
              {user.role} Mode
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
