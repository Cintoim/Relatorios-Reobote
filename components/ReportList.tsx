'use client';

import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertCircle, Wrench, ClipboardList, User, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface Activity {
  type: string;
  status: string;
  description: string;
}

interface Report {
  id: string;
  client: string;
  requester: string;
  equipment: string;
  equipmentTag?: string;
  equipmentLocation?: string;
  supervisor: string;
  activities: Activity[];
  date: string;
  photo?: string;
  observations?: string;
  clientSignature?: string;
  supervisorSignature?: string;
}

interface ReportListProps {
  reports: Report[];
  onReportClick: (report: Report) => void;
}

export default function ReportList({ reports, onReportClick }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Nenhum relatório hoje.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report, index) => {
        const totalActivities = report.activities.length;
        const completedActivities = report.activities.filter(a => a.status === 'completed').length;

        return (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onReportClick(report)}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                    {report.client}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                    Solic: {report.requester}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  {report.equipment}
                  {report.equipmentTag && (
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 rounded font-bold">
                      {report.equipmentTag}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {format(new Date(report.date), "HH:mm '•' d 'de' MMMM", { locale: ptBR })}
                </p>
                {report.equipmentLocation && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {report.equipmentLocation}
                  </p>
                )}
                {report.observations && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 line-clamp-1 italic">
                    "{report.observations}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <User className="w-3 h-3" />
                {report.supervisor}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {report.activities.slice(0, 3).map((act, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold ${
                      act.type === 'preventive' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 
                      act.type === 'corrective' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {act.type[0].toUpperCase()}
                    </div>
                  ))}
                  {report.activities.length > 3 && (
                    <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-400">
                      +{report.activities.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {totalActivities} {totalActivities === 1 ? 'Atividade' : 'Atividades'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${(completedActivities / totalActivities) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  {Math.round((completedActivities / totalActivities) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
