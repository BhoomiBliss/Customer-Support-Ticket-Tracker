// frontend/src/pages/TicketDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { ArrowLeft, User, Calendar, Edit, Save, Trash2, ShieldCheck, AlertCircle, MessageSquare, Send, History } from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Comments state
  const [commentMessage, setCommentMessage] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Agent state variables
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setEditTitle(response.data.title);
      setEditDescription(response.data.description);
      setSelectedStatus(response.data.status);
      setSelectedPriority(response.data.priority);
    } catch (err) {
      console.error('Fetch Ticket Detail Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to sync ticket details from server.');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments?ticketId=${id}`);
      setComments(response.data || []);
    } catch (err) {
      console.error('Fetch Comments Error:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/tickets/${id}/history`);
      setHistory(response.data || []);
    } catch (err) {
      console.error('Fetch History Error:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchTicket(), fetchComments(), fetchHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  // Handler for Customer: Save edit changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLocalLoading(true);

    try {
      const response = await api.put(`/tickets/${id}`, {
        title: editTitle,
        description: editDescription,
      });
      setTicket(response.data);
      setIsEditing(false);
      fetchHistory(); // Sync logs
    } catch (err) {
      console.error('Save Edit Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update ticket changes.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handler for Agent: Save status/priority updates (Status updates go to status endpoint)
  const handleAgentUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLocalLoading(true);

    try {
      // First update priority via standard PUT if it changed
      if (selectedPriority !== ticket.priority) {
        await api.put(`/tickets/${id}`, { priority: selectedPriority });
      }

      // Next update status (creates ticket history log)
      if (selectedStatus !== ticket.status) {
        await api.put(`/tickets/${id}/status`, {
          status: selectedStatus,
          note: statusNote || `Status updated by support agent ${user.name}.`,
        });
        setStatusNote('');
      }

      await loadAllData(); // Refresh details, comments, and history logs
    } catch (err) {
      console.error('Agent Update Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to apply ticket updates.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handler to Post a Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentMessage.trim()) return;

    setCommentsLoading(true);
    try {
      const response = await api.post('/comments', {
        ticketId: id,
        message: commentMessage,
      });
      setComments((prev) => [response.data, ...prev]);
      setCommentMessage('');
    } catch (err) {
      console.error('Add Comment Error:', err);
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handler for Agent: Delete ticket
  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this ticket from the system?')) {
      return;
    }

    setErrorMsg('');
    setLocalLoading(true);

    try {
      await api.delete(`/tickets/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Delete Ticket Error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete support ticket.');
      setLocalLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-darkBg min-h-[calc(100vh-73px)]">
        <Loader />
      </div>
    );
  }

  if (errorMsg && !ticket) {
    return (
      <div className="flex-1 bg-darkBg min-h-[calc(100vh-73px)] p-8 text-left">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="glass-panel max-w-lg mx-auto p-6 rounded-xl border border-brandDanger/20 flex flex-col items-center justify-center text-center mt-12">
          <AlertCircle className="w-12 h-12 text-brandDanger mb-4 animate-pulse" />
          <h4 className="text-lg font-bold text-slate-200">Failed to Load Details</h4>
          <p className="text-sm font-medium text-slate-400 mt-2">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const isOwner = ticket.createdBy._id.toString() === user._id.toString();
  const isAgent = user.role === 'agent' || user.role === 'admin';

  return (
    <div className="flex-1 bg-darkBg min-h-[calc(100vh-73px)] p-6 md:p-8 flex flex-col justify-start relative text-left overflow-y-auto">
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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brandText">Support Case Review</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Review detailed descriptions, write comments, and track ticket lifecycle status changes.
          </p>
        </div>

        {/* Ticket Deletion Action (Agents only) */}
        {isAgent && (
          <button
            onClick={handleDeleteTicket}
            disabled={localLoading}
            className="flex items-center space-x-2 bg-brandDanger/10 hover:bg-brandDanger/20 text-brandDanger border border-brandDanger/30 hover:border-brandDanger/50 px-4 py-2.5 rounded-lg transition-all text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Ticket</span>
          </button>
        )}
      </div>

      {/* API Action Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-brandDanger/10 border border-brandDanger/20 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-brandDanger shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-brandDanger">{errorMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Ticket Content Card & Comments thread (Takes 2 grid slots) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 shadow-glass flex flex-col space-y-6">
            {isEditing ? (
              <form onSubmit={handleSaveChanges} className="space-y-5">
                {/* Title Edit */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Issue Title</label>
                  <input
                    type="text"
                    required
                    disabled={localLoading}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
                  />
                </div>

                {/* Description Edit */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Description</label>
                  <textarea
                    required
                    rows={6}
                    disabled={localLoading}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo resize-none font-medium"
                  />
                </div>

                {/* Action button bar */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={localLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={localLoading}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-2.5 rounded-lg border border-slate-700/60 transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Header Displays */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5 gap-4">
                  <h3 className="text-2xl font-extrabold text-slate-100 leading-tight">{ticket.title}</h3>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <StatusBadge type="status" value={ticket.status} />
                    <StatusBadge type="priority" value={ticket.priority} />
                  </div>
                </div>

                {/* Description content */}
                <div className="text-slate-300 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>

                {/* Customer Edit Action Button (Available ONLY if owner AND status is still 'open') */}
                {isOwner && ticket.status === 'open' && (
                  <div className="border-t border-slate-800/80 pt-5 flex justify-start">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COMMENTS THREAD CONTAINER */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 shadow-glass flex flex-col space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <MessageSquare className="w-5 h-5 text-brandPrimary" />
              <h3 className="text-lg font-bold text-slate-200">Conversation Thread</h3>
            </div>

            {/* Comment Post Form */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                placeholder="Type your response message here..."
                value={commentMessage}
                disabled={commentsLoading}
                onChange={(e) => setCommentMessage(e.target.value)}
                className="glass-input flex-1 px-4 py-2.5 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
              />
              <button
                type="submit"
                disabled={commentsLoading || !commentMessage.trim()}
                className="flex items-center justify-center bg-brandPrimary hover:opacity-90 disabled:opacity-30 text-white p-2.5 rounded-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Comments logs */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const isCommentByAgent = c.userId?.role === 'agent' || c.userId?.role === 'admin';
                  return (
                    <div
                      key={c._id}
                      className={`p-4 rounded-xl border flex flex-col space-y-2 text-left transition-all ${
                        isCommentByAgent
                          ? 'bg-brandPrimary/5 border-brandPrimary/20'
                          : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-200">{c.userId?.name || 'Loading...'}</span>
                          <span
                            className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                              isCommentByAgent
                                ? 'bg-brandPrimary/10 border-brandPrimary/30 text-brandPrimary'
                                : 'bg-brandAccent/10 border-brandAccent/30 text-brandAccent'
                            }`}
                          >
                            {c.userId?.role || 'user'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-300 whitespace-pre-wrap">{c.message}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 font-semibold text-sm">
                  No replies posted on this ticket yet. Write a comment above to start the discussion!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata details & Agent status controls (Takes 1 grid slot) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-glass flex flex-col space-y-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
              Ticket Specifications
            </h4>

            <div className="space-y-4">
              {/* Creator details */}
              <div className="flex items-center space-x-3">
                <div className="bg-brandAccent/10 p-2 rounded-lg shrink-0">
                  <User className="w-4 h-4 text-brandAccent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted By</span>
                  <span className="text-sm font-bold text-slate-200 leading-snug">{ticket.createdBy?.name}</span>
                  <span className="text-xs font-medium text-slate-400 leading-snug">{ticket.createdBy?.email}</span>
                </div>
              </div>

              {/* Assignee details */}
              <div className="flex items-center space-x-3">
                <div className="bg-brandPrimary/10 p-2 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brandPrimary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Representative</span>
                  <span className="text-sm font-bold text-slate-200 leading-snug">
                    {ticket.assignedTo?.name || 'Unassigned (Awaiting Review)'}
                  </span>
                </div>
              </div>

              {/* Created timestamp */}
              <div className="flex items-center space-x-3">
                <div className="bg-slate-800 p-2 rounded-lg shrink-0">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raised On</span>
                  <span className="text-sm font-bold text-slate-200 leading-snug">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT CONTROLS MODULE */}
          {isAgent && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-glass flex flex-col space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-brandAccent" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Representative Panel
                </h4>
              </div>

              <form onSubmit={handleAgentUpdate} className="space-y-4 text-left">
                {/* Status selection */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Case Status</label>
                  <select
                    value={selectedStatus}
                    disabled={localLoading}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm transition-all focus:border-brandPrimary cursor-pointer"
                  >
                    <option value="open" className="bg-darkCard text-slate-100">Open</option>
                    <option value="in-progress" className="bg-darkCard text-slate-100">In Progress</option>
                    <option value="resolved" className="bg-darkCard text-slate-100">Resolved</option>
                  </select>
                </div>

                {/* Priority selection */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity Priority</label>
                  <select
                    value={selectedPriority}
                    disabled={localLoading}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm transition-all focus:border-brandPrimary cursor-pointer"
                  >
                    <option value="low" className="bg-darkCard text-slate-100">Low</option>
                    <option value="medium" className="bg-darkCard text-slate-100">Medium</option>
                    <option value="high" className="bg-darkCard text-slate-100">High</option>
                  </select>
                </div>

                {/* Status Note input */}
                {selectedStatus !== ticket.status && (
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transition Log Note</label>
                    <input
                      type="text"
                      required
                      placeholder="Explain status change (e.g., Assigned developer for investigation)"
                      value={statusNote}
                      disabled={localLoading}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm transition-all focus:border-brandPrimary"
                    />
                  </div>
                )}

                {/* Submit updates button */}
                <button
                  type="submit"
                  disabled={localLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold py-2.5 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Case details</span>
                </button>
              </form>
            </div>
          )}

          {/* ACTIVITY LOGS TIMELINE */}
          {history.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-glass flex flex-col space-y-5">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <History className="w-4 h-4 text-brandPrimary" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Transition Timeline
                </h4>
              </div>

              {/* Vertical timeline list */}
              <div className="relative pl-6 border-l border-slate-800 space-y-6 text-left">
                {history.map((log) => (
                  <div key={log._id} className="relative">
                    {/* Circle tag point */}
                    <span className="absolute -left-[30px] top-1.5 bg-slate-900 border border-slate-700 rounded-full w-2 h-2"></span>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wide">
                          {log.newStatus}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {log.note && <p className="text-xs text-slate-400">{log.note}</p>}
                      <span className="text-[9px] text-slate-500 font-semibold">By: {log.changedBy?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
