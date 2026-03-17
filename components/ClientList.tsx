import React from 'react';
import { User, MapPin, Building2, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ClientData } from './ClientForm';

interface ClientListProps {
  clients: ClientData[];
  onEdit: (client: ClientData) => void;
  onDelete: (id: string) => void;
}

export default function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold mb-1">Nenhum cliente cadastrado</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Cadastre seus clientes para facilitar o preenchimento dos relatórios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client, index) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">CNPJ: {client.cnpj}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEdit(client)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(client.id)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="text-xs truncate">
                {client.address}, {client.neighborhood} - {client.city}/{client.uf}
              </span>
            </div>
            {client.requesters && client.requesters.length > 0 && (
              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 col-span-full mt-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {client.requesters.length} {client.requesters.length === 1 ? 'Solicitante cadastrado' : 'Solicitantes cadastrados'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
