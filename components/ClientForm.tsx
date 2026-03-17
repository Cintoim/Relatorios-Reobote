import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useFieldArray } from 'react-hook-form';

const requesterSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  contact: z.string().min(8, "Contato é obrigatório"),
});

const clientSchema = z.object({
  name: z.string().min(2, "Nome/Razão Social é obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  stateRegistration: z.string().optional(),
  address: z.string().min(5, "Endereço é obrigatório"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  cep: z.string().min(8, "CEP inválido"),
  requesters: z.array(requesterSchema).default([]),
});

export type ClientData = z.infer<typeof clientSchema> & { id: string };

interface ClientFormProps {
  initialData?: ClientData | null;
  onSave: (data: ClientData) => void;
  onCancel: () => void;
}

export default function ClientForm({ initialData, onSave, onCancel }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      requesters: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requesters"
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    onSave({
      ...data,
      id: initialData?.id || Date.now().toString(),
    });
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razão Social / Nome</label>
          <input 
            {...register("name")}
            placeholder="Nome completo ou Razão Social"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
            <input 
              {...register("cnpj")}
              placeholder="00.000.000/0000-00"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inscrição Estadual</label>
            <input 
              {...register("stateRegistration")}
              placeholder="Isento ou Número"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
            <input 
              {...register("address")}
              placeholder="Rua, número, compl."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CEP</label>
            <input 
              {...register("cep")}
              placeholder="00000-000"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
            <input 
              {...register("neighborhood")}
              placeholder="Bairro"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
            <input 
              {...register("city")}
              placeholder="Cidade"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">UF</label>
            <input 
              {...register("uf")}
              placeholder="SP"
              maxLength={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
            />
            {errors.uf && <p className="text-red-500 text-xs mt-1">{errors.uf.message}</p>}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Solicitantes Autorizados
            </h3>
            <button 
              type="button"
              onClick={() => append({ name: "", email: "", contact: "" })}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar Solicitante
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 relative">
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome do Solicitante</label>
                  <input 
                    {...register(`requesters.${index}.name` as const)}
                    placeholder="Nome completo"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {errors.requesters?.[index]?.name && (
                    <p className="text-red-500 text-[10px] mt-1">{errors.requesters[index]?.name?.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">E-mail</label>
                    <input 
                      {...register(`requesters.${index}.email` as const)}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Contato / WhatsApp</label>
                    <input 
                      {...register(`requesters.${index}.contact` as const)}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {errors.requesters?.[index]?.contact && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.requesters[index]?.contact?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400 dark:text-slate-500">Nenhum solicitante cadastrado para este cliente.</p>
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Cliente
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
