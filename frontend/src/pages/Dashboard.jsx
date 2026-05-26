// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import TicketCard from '../components/TicketCard';
import StatsCards from '../components/StatsCards';
import { Search, Inbox, AlertCircle, SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Normalizes ticket status values to safe kebab-case formats
 * @param {string} status - Raw status string
 * @returns {string} Normalized status
 */
const normalizeStatus = (status) => {
  return status?.toLowerCase().replace(/\s/g, '-').replace('_', '-') || '';
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination states (limit = 5)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // Options: newest, oldest, priority-desc, priority-asc

  // Stats counter state
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const response = await api.get('/tickets', {
        params: {
          page: currentPage,
          limit: 5,
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
        },
      });

      const { tickets: fetchedTickets, totalPages: pages, totalTickets: total, stats: fetchedStats } = response.data;

      setTickets(fetchedTickets || []);
      setTotalPages(pages || 1);
      setTotalTickets(total || 0);

      if (fetchedStats) {
        setStats(fetchedStats);
      }
    } catch (err) {
      console.error('Fetch Tickets Error:', err);
      if (err?.response?.status === 401) {
        setErrorMsg('Session expired. Please login again.');
      } else {
        setErrorMsg('Failed to sync support tickets with server database.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch tickets whenever filters, search query, or page shifts
  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, priorityFilter, searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset page on query shift
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority);
    setCurrentPage(1);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Safe sorting mapping in React state (keeps backend CRUD simple)
  const getSortedTickets = (ticketList) => {
    const listCopy = [...ticketList];
    if (sortBy === 'newest') {
      return listCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return listCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    if (sortBy === 'priority-desc') {
      const weight = { high: 3, medium: 2, low: 1 };
      return listCopy.sort((a, b) => (weight[b.priority.toLowerCase()] || 0) - (weight[a.priority.toLowerCase()] || 0));
    }
    if (sortBy === 'priority-asc') {
      const weight = { high: 3, medium: 2, low: 1 };
      return listCopy.sort((a, b) => (weight[a.priority.toLowerCase()] || 0) - (weight[b.priority.toLowerCase()] || 0));
    }
    return listCopy;
  };

  const sortedTickets = getSortedTickets(tickets);
  const isFiltered = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  // Shimmer Row skeleton loader component
  const ShimmerRow = () => (
    <div className="glass-panel border-l-4 border-l-slate-800 rounded-xl p-5 animate-pulse flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-left">
      <div className="flex-1 flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <div className="h-5 bg-slate-850 rounded w-1/3"></div>
          <div className="h-5 bg-slate-850 rounded w-16"></div>
          <div className="h-5 bg-slate-850 rounded w-16"></div>
        </div>
        <div className="h-4 bg-slate-850 rounded w-1/2"></div>
        <div className="flex items-center space-x-4 pt-1">
          <div className="h-3 bg-slate-850 rounded w-20"></div>
          <div className="h-3 bg-slate-850 rounded w-20"></div>
        </div>
      </div>
      <div className="w-10 h-10 bg-slate-850 rounded-lg shrink-0 md:ml-4"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-darkBg min-h-[calc(100vh-73px)] p-6 md:p-8 overflow-y-auto">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0 text-left">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brandText">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            {user?.role === 'agent' || user?.role === 'admin'
              ? `System Control Desk (${user?.role.toUpperCase()} View)`
              : 'Submit and track the progress of your active support requests'}
          </p>
        </div>

        {/* Customer Ticket Creation CTA */}
        {user?.role === 'customer' && (
          <Link
            to="/new-ticket"
            className="flex items-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold px-4 py-2.5 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </Link>
        )}
      </div>

      {/* Sync Failure Error Banner */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-brandDanger/10 border border-brandDanger/20 flex items-start space-x-3 text-left">
          <AlertCircle className="w-5 h-5 text-brandDanger shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-brandDanger">{errorMsg}</span>
        </div>
      )}

      {/* Global Analytics counters cards */}
      <StatsCards stats={stats} loading={loading && tickets.length === 0} />

      {/* Advanced FilterBar & Search Control Layout */}
      <div className="glass-panel rounded-xl p-4 mb-6 border border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Search bar input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search tickets by subject or description keywords..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all focus:border-brandPrimary focus:shadow-neonIndigo"
          />
        </div>

        {/* Filter controls toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filtering tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800/60">
            {['all', 'open', 'in-progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-brandPrimary text-white shadow-neonIndigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Priority dropdown select */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="glass-input pl-3.5 pr-8 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer appearance-none min-w-[130px] text-slate-300"
            >
              <option value="all" className="bg-darkCard">All Priorities</option>
              <option value="low" className="bg-darkCard">Low</option>
              <option value="medium" className="bg-darkCard">Medium</option>
              <option value="high" className="bg-darkCard">High</option>
            </select>
            <SlidersHorizontal className="absolute right-3.5 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
          </div>

          {/* Sort By selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="glass-input pl-3.5 pr-8 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer appearance-none min-w-[150px] text-slate-300"
            >
              <option value="newest" className="bg-darkCard">Newest First</option>
              <option value="oldest" className="bg-darkCard">Oldest First</option>
              <option value="priority-desc" className="bg-darkCard">Highest Severity</option>
              <option value="priority-asc" className="bg-darkCard">Lowest Severity</option>
            </select>
            <SlidersHorizontal className="absolute right-3.5 top-3 w-3 h-3 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tickets List View Feed */}
      <div className="space-y-4">
        {loading ? (
          // Render shimmer cards while loading
          Array.from({ length: 3 }).map((_, idx) => (
            <ShimmerRow key={idx} />
          ))
        ) : sortedTickets.length > 0 ? (
          <>
            {sortedTickets.map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}

            {/* Pagination Navigation Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 mt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs font-semibold text-slate-400">
                  Page {currentPage} of {totalPages} ({totalTickets} total matches)
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          // Polished Empty State Display
          <div className="glass-panel rounded-xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-12 transition-all">
            <Inbox className="w-16 h-16 text-slate-500 mb-5 animate-pulse" />
            <h4 className="text-xl font-bold text-slate-200">No Tickets Found</h4>
            <p className="text-sm font-semibold text-slate-400 mt-2.5 max-w-sm">
              {isFiltered
                ? 'No support tickets match your active filter criteria or search keyword query.'
                : "You don't have any support tickets raised yet. Create your first ticket to get started!"}
            </p>
            {isFiltered ? (
              <button
                onClick={handleClearFilters}
                className="mt-6 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-xs font-bold uppercase tracking-wider text-slate-200 rounded-lg transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              user?.role === 'customer' && (
                <Link
                  to="/new-ticket"
                  className="mt-6 flex items-center space-x-2 bg-gradient-to-r from-brandPrimary to-brandAccent hover:opacity-95 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-neonIndigo hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Ticket</span>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
