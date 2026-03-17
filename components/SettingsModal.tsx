'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Garantir que temos um valor válido para comparação
  const activeTheme = theme || 'light';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:right-auto md:w-[400px] md:-translate-x-1/2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Configurações</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                  Tema do Sistema
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      activeTheme === 'light'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="font-bold text-sm">Normal</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      activeTheme === 'dark'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="font-bold text-sm">Escuro</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 text-center">
                  Versão 1.0.0 • Relatórios Reobote
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
