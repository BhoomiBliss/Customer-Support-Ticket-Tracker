// frontend/src/pages/NewTicket.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { Ticket, FileText, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import Loader from '../components/Loader';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Route security block: ensure only customers can access ticket submission forms
  useEffect(() => {
    if (!loading && user && user.role !== 'customer') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLocalLoading(true);

    try {
      await api.post('/tickets', { title, description, priority });
      navigate('/'); // Redirect to Dashboard on success
    } catch (err) {
      console.error('Submit Ticket Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit support ticket. Please check input parameters.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading || (user && user.role !== 'customer')) {
    return (
      <div className="h-screen w-screen bg-darkBg flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-darkBg min-h-[calc(100vh-73px)] p-6 md:p-8 flex flex-col justify-start relative text-left">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Greetings Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-brandText">Submit Support Ticket</h2>
        <p className="text-sm font-semibold text-slate-400 mt-1">
          Describe the technical or account issue you are facing, and our support representatives will respond.
        </p>
      </div>

      {/* Main glass creator box */}
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 md:p-8 border border-slate-800 shadow-glass">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-brandDanger/10 border border-brandDanger/30 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-brandDanger shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-brandDanger">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Subject Title */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Title</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Ticket className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                disabled={localLoading}
                placeholder="Brief summary (e.g. Cannot process invoice checkout)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
              />
            </div>
          </div>

          {/* Issue Priority Selector */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Severity Priority</label>
            <select
              value={priority}
              disabled={localLoading}
              onChange={(e) => setPriority(e.target.value)}
              className="glass-input w-full px-3.5 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary cursor-pointer"
            >
              <option value="low" className="bg-darkCard text-slate-100">
                Low (Minor bugs, styling suggestions)
              </option>
              <option value="medium" className="bg-darkCard text-slate-100">
                Medium (Standard functional issue)
              </option>
              <option value="high" className="bg-darkCard text-slate-100">
                High (Major blockers, payment/account failures)
              </option>
            </select>
          </div>

          {/* Ticket Description Input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Description</label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 flex items-center text-slate-500">
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                required
                rows={5}
                disabled={localLoading}
                placeholder="Explain the steps to reproduce the issue, along with any error messages you see..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo resize-none"
              />
            </div>
          </div>

          {/* Submit button layout */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={localLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {localLoading ? (
                <span className="text-sm">Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Raise Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
