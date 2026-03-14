'use client';

import React from 'react';
import { ClipboardCheck, Clock, AlertCircle } from 'lucide-react';

interface StatsCardProps {
  reports: { clientSignature?: string; supervisorSignature?: string }[];
  currentFilter: 'all' | 'pending' | 'completed';
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void;
}

export default function StatsCard({ reports, currentFilter, onFilterChange }: StatsCardProps) {
  const total = reports.length;
  const pending = reports.filter(r => !r.clientSignature || !r.supervisorSignature).length;
  const completed = reports.filter(r => r.clientSignature && r.supervisorSignature).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button 
        onClick={() => onFilterChange('all')}
        className={`text-left p-4 rounded-2xl shadow-sm border transition-all ${currentFilter === 'all' ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${currentFilter === 'all' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
          <ClipboardCheck className={`w-4 h-4 ${currentFilter === 'all' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${currentFilter === 'all' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>Relatórios</p>
        <p className={`text-xl font-black ${currentFilter === 'all' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{total}</p>
      </button>
      
      <button 
        onClick={() => onFilterChange('pending')}
        className={`text-left p-4 rounded-2xl shadow-sm border transition-all ${currentFilter === 'pending' ? 'bg-amber-500 border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${currentFilter === 'pending' ? 'bg-white/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <Clock className={`w-4 h-4 ${currentFilter === 'pending' ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${currentFilter === 'pending' ? 'text-amber-50' : 'text-slate-400 dark:text-slate-500'}`}>Pendentes</p>
        <p className={`text-xl font-black ${currentFilter === 'pending' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{pending}</p>
      </button>

      <button 
        onClick={() => onFilterChange('completed')}
        className={`text-left p-4 rounded-2xl shadow-sm border transition-all ${currentFilter === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${currentFilter === 'completed' ? 'bg-white/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
          <AlertCircle className={`w-4 h-4 ${currentFilter === 'completed' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${currentFilter === 'completed' ? 'text-emerald-50' : 'text-slate-400 dark:text-slate-500'}`}>Concluídos</p>
        <p className={`text-xl font-black ${currentFilter === 'completed' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{completed}</p>
      </button>
    </div>
  );
}
