import React from 'react';
import { Check } from 'lucide-react';

export default function TaskFlowLogo({ size = 'default', showBadge = true }) {
  const isLarge = size === 'large';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200 ${
        isLarge ? 'w-10 h-10' : 'w-8 h-8'
      }`}>
        <Check className={`${isLarge ? 'w-6 h-6 stroke-[3]' : 'w-4 h-4 stroke-[3]'}`} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`font-bold tracking-tight text-slate-900 ${
          isLarge ? 'text-2xl' : 'text-xl'
        }`}>
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

