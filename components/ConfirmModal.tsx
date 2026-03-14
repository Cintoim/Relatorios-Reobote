'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:right-auto md:w-[400px] md:-translate-x-1/2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">{message}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onCancel}
                  className="py-3 px-4 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`py-3 px-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${
                    type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
