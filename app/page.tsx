'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, Search, ClipboardList, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import StatsCard from '@/components/StatsCard';
import ReportList from '@/components/ReportList';
import ReportForm from '@/components/ReportForm';
import ReportDetail from '@/components/ReportDetail';
import ClientForm, { ClientData } from '@/components/ClientForm';
import ClientList from '@/components/ClientList';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'clients'>('reports');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedReports = localStorage.getItem('industrial_reports');
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      }
      
      const savedClients = localStorage.getItem('industrial_clients');
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
      
      setIsLoading(false);
    };
    init();
  }, []);

  const saveReport = (newReport: any) => {
    let updated;
    if (newReport.id) {
      updated = reports.map(r => r.id === newReport.id ? newReport : r);
    } else {
      updated = [{ ...newReport, id: Date.now().toString() }, ...reports];
    }
    
    setReports(updated);
    localStorage.setItem('industrial_reports', JSON.stringify(updated));
    setIsFormOpen(false);
    setSelectedReport(null);
    setIsDetailOpen(false);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b']
    });
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('industrial_reports', JSON.stringify(updated));
    setIsDetailOpen(false);
    setSelectedReport(null);
  };

  const saveClient = (newClient: ClientData) => {
    let updated;
    const existingIndex = clients.findIndex(c => c.id === newClient.id);
    
    if (existingIndex >= 0) {
      updated = clients.map(c => c.id === newClient.id ? newClient : c);
    } else {
      updated = [newClient, ...clients];
    }
    
    setClients(updated);
    localStorage.setItem('industrial_clients', JSON.stringify(updated));
    setIsClientFormOpen(false);
    setSelectedClient(null);
    
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#2563eb', '#10b981']
    });
  };

  const deleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      localStorage.setItem('industrial_clients', JSON.stringify(updated));
    }
  };

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleEditReport = (report: any) => {
    setSelectedReport(report);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: ClientData) => {
    setSelectedClient(client);
    setIsClientFormOpen(true);
  };

  const handleCreateNew = () => {
    if (activeTab === 'reports') {
      setSelectedReport(null);
      setIsFormOpen(true);
    } else {
      setSelectedClient(null);
      setIsClientFormOpen(true);
    }
  };

  const filteredReports = reports.filter(r => {
    if (reportFilter === 'pending') return !r.clientSignature || !r.supervisorSignature;
    if (reportFilter === 'completed') return r.clientSignature && r.supervisorSignature;
    return true;
  });

  return (
    <main className="min-h-screen pb-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 px-6 pt-8 pb-4 sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Relatórios Reobote</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'}`}
          >
            <ClipboardList className="w-4 h-4" />
            Relatórios
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clients' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'}`}
          >
            <Users className="w-4 h-4" />
            Clientes
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={activeTab === 'reports' ? "Buscar equipamentos ou técnicos..." : "Buscar clientes por nome ou CNPJ..."}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </header>

      <div className="px-6 py-6 space-y-8">
        {activeTab === 'reports' ? (
          <>
            {/* Stats */}
            <section>
              <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Resumo do Dia</h2>
              <StatsCard 
                reports={reports} 
                currentFilter={reportFilter}
                onFilterChange={setReportFilter}
              />
            </section>

            {/* Reports List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {reportFilter === 'all' ? 'Relatórios Recentes' : 
                   reportFilter === 'pending' ? 'Relatórios Pendentes (Sem Assinatura)' : 
                   'Relatórios Concluídos (Assinados)'}
                </h2>
                <button 
                  onClick={() => setReportFilter('all')}
                  className="text-xs font-bold text-blue-600"
                >
                  Ver todos
                </button>
              </div>
              
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ReportList reports={filteredReports} onReportClick={handleReportClick} />
              )}
            </section>
          </>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Clientes Cadastrados</h2>
              <span className="text-xs font-bold text-slate-400">{clients.length} total</span>
            </div>
            
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ClientList 
                clients={clients} 
                onEdit={handleEditClient} 
                onDelete={deleteClient} 
              />
            )}
          </section>
        )}
      </div>

      {/* Floating Action Button */}
      {!isFormOpen && !isDetailOpen && !isClientFormOpen && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCreateNew}
          className="fixed bottom-8 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-400 dark:shadow-blue-900/40 flex items-center justify-center text-white z-40"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {isDetailOpen && selectedReport && (
          <ReportDetail 
            report={selectedReport} 
            onClose={() => setIsDetailOpen(false)} 
            onEdit={handleEditReport}
            onDelete={deleteReport}
          />
        )}
      </AnimatePresence>

      {/* Report Form Modal Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm px-4 pt-12 pb-8 overflow-y-auto"
          >
            <ReportForm 
              initialData={selectedReport}
              clients={clients}
              onSave={saveReport} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Form Modal Overlay */}
      <AnimatePresence>
        {isClientFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm px-4 pt-12 pb-8 overflow-y-auto"
          >
            <ClientForm 
              initialData={selectedClient}
              onSave={saveClient} 
              onCancel={() => setIsClientFormOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </main>
  );
}
