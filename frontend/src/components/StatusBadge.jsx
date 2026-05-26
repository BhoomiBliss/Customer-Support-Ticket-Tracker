// frontend/src/components/StatusBadge.jsx
import React from 'react';

/**
 * Modern colored tags for ticket statuses and priority weights.
 * @param {string} type - Either 'status' or 'priority'
 * @param {string} value - Status or Priority value string
 */
const StatusBadge = ({ type, value }) => {
  if (!value) return null;

  const normalized = value.toLowerCase();
  let badgeStyles = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ';

  if (type === 'status') {
    switch (normalized) {
      case 'open':
        badgeStyles += 'bg-brandAccent/10 border-brandAccent/30 text-brandAccent';
        break;
      case 'in-progress':
        badgeStyles += 'bg-brandPrimary/10 border-brandPrimary/30 text-brandPrimary';
        break;
      case 'resolved':
        badgeStyles += 'bg-brandSuccess/10 border-brandSuccess/30 text-brandSuccess';
        break;
      default:
        badgeStyles += 'bg-slate-800 border-slate-700 text-slate-400';
    }
  } else if (type === 'priority') {
    switch (normalized) {
      case 'low':
        badgeStyles += 'bg-slate-800/80 border-slate-700 text-slate-400';
        break;
      case 'medium':
        badgeStyles += 'bg-amber-500/10 border-amber-500/30 text-amber-400';
        break;
      case 'high':
        badgeStyles += 'bg-brandDanger/10 border-brandDanger/30 text-brandDanger';
        break;
      default:
        badgeStyles += 'bg-slate-800 border-slate-700 text-slate-400';
    }
  }

  return (
    <span className={badgeStyles}>
      {value}
    </span>
  );
};

export default StatusBadge;
