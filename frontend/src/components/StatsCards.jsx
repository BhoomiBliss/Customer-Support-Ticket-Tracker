// frontend/src/components/StatsCards.jsx
import React from 'react';
import { Inbox, Activity, Hourglass, CheckCircle2 } from 'lucide-react';

/**
 * Renders the analytics dashboard metrics grid with premium animations and glassmorphism.
 * @param {Object} stats - Statistics counters containing total, open, inProgress, and resolved.
 * @param {boolean} loading - Displays loading skeletons if true.
 */
const StatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: Inbox,
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-800/60 border-slate-700/40',
      iconClass: 'bg-slate-800/80 text-slate-400 border-slate-700/50',
    },
    {
      title: 'Open Cases',
      value: stats.open,
      icon: Activity,
      colorClass: 'text-brandAccent',
      bgClass: 'bg-brandAccent/5 border-brandAccent/10',
      iconClass: 'bg-brandAccent/10 text-brandAccent border-brandAccent/20',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Hourglass,
      colorClass: 'text-brandPrimary',
      bgClass: 'bg-brandPrimary/5 border-brandPrimary/10',
      iconClass: 'bg-brandPrimary/10 text-brandPrimary border-brandPrimary/20',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      colorClass: 'text-brandSuccess',
      bgClass: 'bg-brandSuccess/5 border-brandSuccess/10',
      iconClass: 'bg-brandSuccess/10 text-brandSuccess border-brandSuccess/20',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-xl p-5 border border-slate-800/60 flex items-center justify-between text-left animate-pulse"
          >
            <div className="flex flex-col space-y-2.5 flex-1 pr-4">
              <div className="h-3 bg-slate-800 rounded w-20"></div>
              <div className="h-7 bg-slate-800 rounded w-12"></div>
            </div>
            <div className="w-11 h-11 bg-slate-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-xl p-5 border ${card.bgClass} flex items-center justify-between text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {card.title}
              </span>
              <span className={`text-2xl font-black ${card.colorClass}`}>
                {card.value}
              </span>
            </div>
            <div className={`p-3 rounded-lg border ${card.iconClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
