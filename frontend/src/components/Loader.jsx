// frontend/src/components/Loader.jsx
import React from 'react';

/**
 * Premium glassmorphic neon spinner loader for SaaS workspaces.
 */
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Glow spinning outline */}
      <div className="w-12 h-12 border-4 border-slate-800 border-t-brandPrimary rounded-full animate-spin shadow-neonIndigo"></div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
        Loading Workspace...
      </p>
    </div>
  );
};

export default Loader;
