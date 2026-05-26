// frontend/src/components/TicketCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Calendar, User, ArrowRight } from 'lucide-react';

/**
 * Animated ticket card with custom priority status strips.
 * @param {Object} ticket - Support ticket document
 */
const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();

  // Map priorities to color accent indicators
  const priorityBorderColors = {
    low: 'border-l-slate-700',
    medium: 'border-l-amber-500',
    high: 'border-l-brandDanger',
  };

  const borderClass = priorityBorderColors[ticket.priority.toLowerCase()] || 'border-l-slate-700';

  const handleCardClick = () => {
    navigate(`/tickets/${ticket._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`glass-panel border-l-4 ${borderClass} rounded-xl p-5 hover:border-r hover:border-t hover:border-b hover:border-slate-700/60 transition-all hover:scale-[1.01] hover:shadow-glass hover:translate-x-1 cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 text-left`}
    >
      {/* Left Column: Details Summary */}
      <div className="flex-1 flex flex-col space-y-2">
        <div className="flex items-center space-x-3">
          <h4 className="text-lg font-bold text-slate-100 group-hover:text-brandPrimary transition-colors leading-tight">
            {ticket.title}
          </h4>
          <div className="flex items-center space-x-1.5 shrink-0">
            <StatusBadge type="status" value={ticket.status} />
            <StatusBadge type="priority" value={ticket.priority} />
          </div>
        </div>

        {/* Truncated Description */}
        <p className="text-sm text-slate-400 font-medium max-w-xl line-clamp-1">
          {ticket.description}
        </p>

        {/* Metadata Details */}
        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 pt-1">
          <div className="flex items-center space-x-1">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>By: {ticket.createdBy?.name || 'Loading...'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive link arrows */}
      <div className="flex items-center justify-end md:pl-4">
        <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/50 hover:bg-brandPrimary/10 hover:border-brandPrimary/30 transition-colors">
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brandPrimary" />
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
