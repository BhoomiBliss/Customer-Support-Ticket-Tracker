// frontend/src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already authenticated, redirect them to the home dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLocalLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-darkBg flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] w-full flex items-center justify-center relative p-6 bg-darkBg overflow-hidden">
      {/* Background Neon Glowing Blobs */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-brandPrimary/20 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-brandAccent/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

      {/* Main Glass Card Form Container */}
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-glass border border-slate-800 z-10 transition-all hover:border-slate-700/60 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brandPrimary to-brandAccent bg-clip-text text-transparent inline-block">
            Welcome Back
          </h2>
          <p className="text-sm font-semibold text-slate-400 mt-2">Sign in to manage support requests</p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-brandDanger/10 border border-brandDanger/30 flex items-start space-x-3 text-left">
            <AlertCircle className="w-5 h-5 text-brandDanger shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-brandDanger">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Email input field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                disabled={localLoading}
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                disabled={localLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
              />
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={localLoading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold py-3 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {localLoading ? (
              <span className="text-sm">Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-semibold text-slate-400">
          New to SupportDesk?{' '}
          <Link to="/register" className="text-brandAccent hover:underline font-bold transition-all">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
