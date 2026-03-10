'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Settings, Search, ClipboardList, Users, Home as HomeIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import StatsCard from '@/components/StatsCard';
import ReportList from '@/components/ReportList';
import ReportForm from '@/components/ReportForm';
import ReportDetail from '@/components/ReportDetail';
import ClientForm, { ClientData } from '@/components/ClientForm';
import ClientList from '@/components/ClientList';
import SettingsModal from '@/components/SettingsModal';

type ViewType = 'home' | 'reports' | 'clients' | 'settings';

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    setIsDetailOpen(false);
    setIsFormOpen(false);
    setIsClientFormOpen(false);
    setIsSettingsOpen(false);
    setSearchQuery('');
  };

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
    if (activeView === 'clients') {
      setSelectedClient(null);
      setIsClientFormOpen(true);
    } else {
      setSelectedReport(null);
      setIsFormOpen(true);
    }
  };

  const todaysReports = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return reports.filter(r => new Date(r.date).toLocaleDateString() === today);
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesFilter = 
        reportFilter === 'all' ? true :
        reportFilter === 'pending' ? (!r.clientSignature || !r.supervisorSignature) :
        (r.clientSignature && r.supervisorSignature);
      
      const matchesSearch = searchQuery === '' ? true :
        r.equipment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supervisor?.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesFilter && matchesSearch;
    });
  }, [reports, reportFilter, searchQuery]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (searchQuery === '') return true;
      return c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.cnpj?.includes(searchQuery);
    });
  }, [clients, searchQuery]);

  const recentReports = useMemo(() => {
    return todaysReports
      .filter(r => {
        if (reportFilter === 'all') return true;
        if (reportFilter === 'pending') return !r.clientSignature || !r.supervisorSignature;
        if (reportFilter === 'completed') return r.clientSignature && r.supervisorSignature;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [todaysReports, reportFilter]);

  return (
    <main className="min-h-screen pb-32 bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 px-4 sm:px-6 pt-6 pb-4 sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">Relatórios Reobote</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeView === 'home' ? 'Início' : 
                 activeView === 'reports' ? 'Relatórios' : 
                 activeView === 'clients' ? 'Clientes' : 'Configurações'}
              </p>
            </div>
          </button>
        </div>

        {(activeView === 'reports' || activeView === 'clients') && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeView === 'reports' ? "Buscar equipamentos ou técnicos..." : "Buscar clientes por nome ou CNPJ..."}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        )}
      </header>

      <div className="px-6 py-6 space-y-8">
        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeView === 'home' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section>
                  <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Resumo do Dia</h2>
                  <StatsCard 
                    reports={todaysReports} 
                    currentFilter={reportFilter}
                    onFilterChange={setReportFilter}
                  />
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {reportFilter === 'all' ? 'Relatórios do Dia' : 
                       reportFilter === 'pending' ? 'Pendentes do Dia' : 'Concluídos do Dia'}
                    </h2>
                    <button onClick={() => handleNavigate('reports')} className="text-xs font-bold text-blue-600">Ver todos</button>
                  </div>
                  {recentReports.length > 0 ? (
                    <ReportList reports={recentReports} onReportClick={handleReportClick} />
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-sm text-slate-400 font-medium">Nenhum relatório {reportFilter !== 'all' ? reportFilter === 'pending' ? 'pendente' : 'concluído' : ''} hoje.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeView === 'reports' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {reportFilter === 'all' ? 'Todos os Relatórios' : 
                       reportFilter === 'pending' ? 'Pendentes' : 'Concluídos'}
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setReportFilter('all')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${reportFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >
                        Tudo
                      </button>
                      <button 
                        onClick={() => setReportFilter('pending')}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${reportFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      >
                        Pendentes
                      </button>
                    </div>
                  </div>
                  <ReportList reports={filteredReports} onReportClick={handleReportClick} />
                </section>
              </motion.div>
            )}

            {activeView === 'clients' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Clientes Cadastrados</h2>
                  <span className="text-xs font-bold text-slate-400">{clients.length} total</span>
                </div>
                <ClientList 
                  clients={filteredClients} 
                  onEdit={handleEditClient} 
                  onDelete={deleteClient} 
                />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Configurações do Aplicativo</h2>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Tema Escuro</h3>
                        <p className="text-xs text-slate-400">Alternar entre modo claro e escuro</p>
                      </div>
                      <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold"
                      >
                        Configurar
                      </button>
                    </div>
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                      <p className="text-xs text-slate-400 text-center">Versão 1.0.0 • Relatórios Reobote</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 py-3 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between relative">
          <button 
            onClick={() => handleNavigate('home')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Início</span>
          </button>

          <button 
            onClick={() => handleNavigate('reports')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'reports' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-[10px] font-bold">Relatórios</span>
          </button>

          {/* Central Add Button */}
          <div className="relative -top-8">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleCreateNew}
              className="w-14 h-14 bg-blue-600 rounded-full shadow-xl shadow-blue-400 dark:shadow-blue-900/40 flex items-center justify-center text-white"
            >
              <Plus className="w-8 h-8" />
            </motion.button>
          </div>

          <button 
            onClick={() => handleNavigate('clients')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'clients' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Clientes</span>
          </button>

          <button 
            onClick={() => handleNavigate('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold">Ajustes</span>
          </button>
        </div>
      </nav>

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
