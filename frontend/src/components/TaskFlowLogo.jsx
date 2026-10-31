import React from 'react';
import taskecoLogo from '../assets/taskeco-logo.png';

export default function TaskFlowLogo({ size = 'default', showBadge = true, white = false }) {
  const isLarge = size === 'large';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`flex items-center justify-center shrink-0 ${
          isLarge ? 'w-10 h-10' : 'w-8 h-8'
        }`}
      >
        <img
          src={taskecoLogo}
          alt="TaskEco Logo"
          className="w-full h-full object-contain select-none"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-bold tracking-tight ${white ? 'text-white' : 'text-slate-900'} ${
            isLarge ? 'text-2xl' : 'text-xl'
          }`}
        >
          TaskEco
        </span>
        {showBadge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-indigo-100/80 text-indigo-600 border border-indigo-200/50">
            DEMO
          </span>
        )}
      </div>
    </div>
  );
}
