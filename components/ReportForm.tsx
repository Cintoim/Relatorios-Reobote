'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Save, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const CameraCapture = dynamic(() => import('./CameraCapture'), { ssr: false });
const SignaturePad = dynamic(() => import('./SignaturePad'), { ssr: false });
import { ClientData } from './ClientForm';

const activitySchema = z.object({
  type: z.enum(["preventive", "corrective", "predictive", "inspection"]),
  status: z.enum(["completed", "pending", "in_progress"]),
  description: z.string().min(5, "Descreva a atividade (mín. 5 caracteres)"),
});

const idleHourSchema = z.object({
  reason: z.string().min(2, "Motivo é obrigatório"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
});

export const reportSchema = z.object({
  client: z.string().min(2, "Cliente é obrigatório"),
  requester: z.string().min(2, "Solicitante é obrigatório"),
  requesterEmail: z.string().optional(),
  requesterContact: z.string().optional(),
  equipment: z.string().min(2, "Equipamento é obrigatório"),
  equipmentTag: z.string().optional(),
  equipmentLocation: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm").default("08:00"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm").default("17:00"),
  supervisor: z.string().min(2, "Nome do encarregado é obrigatório"),
  activities: z.array(activitySchema).min(1, "Adicione pelo menos uma atividade"),
  idleHours: z.array(idleHourSchema).default([]),
  photos: z.array(z.string()).default([]),
  observations: z.string().optional(),
  clientSignature: z.string().optional(),
  supervisorSignature: z.string().optional(),
});

export type Report = z.infer<typeof reportSchema> & { 
  id: string; 
  date: string;
  photo?: string;
};

  interface ReportFormProps {
  initialData?: Report | null;
  clients?: ClientData[];
  onSave: (data: Report) => void;
  onCancel: () => void;
}

export default function ReportForm({ initialData, clients = [], onSave, onCancel }: ReportFormProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || (initialData?.photo ? [initialData.photo] : []));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<Report>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData || {
      activities: [{ type: "preventive", status: "completed", description: "" }]
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setPhotos(initialData.photos || (initialData.photo ? [initialData.photo] : []));
    }
  }, [initialData, reset]);

  const activities = watch("activities");
  const idleHours = watch("idleHours") || [];
  const selectedClientName = watch("client");

  const availableRequesters = React.useMemo(() => {
    const client = clients.find(c => c.name === selectedClientName);
    return client?.requesters || [];
  }, [selectedClientName, clients]);

  // Auto-fill requester details when requester name changes
  const selectedRequesterName = watch("requester");
  useEffect(() => {
    const requester = availableRequesters.find(r => r.name === selectedRequesterName);
    if (requester) {
      setValue("requesterEmail", requester.email);
      setValue("requesterContact", requester.contact);
    }
  }, [selectedRequesterName, availableRequesters, setValue]);

  const addActivity = () => {
    setValue("activities", [...activities, { type: "preventive", status: "completed", description: "" }]);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      const newActivities = activities.filter((_, i) => i !== index);
      setValue("activities", newActivities);
    }
  };

  const addIdleHour = () => {
    setValue("idleHours", [...idleHours, { reason: "", startTime: "08:00", endTime: "09:00" }]);
  };

  const removeIdleHour = (index: number) => {
    const newIdleHours = idleHours.filter((_, i) => i !== index);
    setValue("idleHours", newIdleHours);
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const diff = endTotal - startTotal;
    return diff > 0 ? diff / 60 : 0;
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const totalIdleHours = idleHours.reduce((acc, curr) => {
    return acc + calculateDuration(curr.startTime, curr.endTime);
  }, 0);

  const onSubmit = async (data: Report) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave({
      ...data,
      id: initialData?.id || '',
      photos: photos,
      date: initialData?.date || new Date().toISOString(),
    });
    setIsSubmitting(false);
  };

  const handleCapture = (imageData: string) => {
    setPhotos(prev => [...prev, imageData]);
    setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setPhotos(prev => [...prev, compressedDataUrl]);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (isCameraOpen) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{initialData?.id ? 'Editar Relatório' : 'Novo Relatório'}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
            <input 
              {...register("client")}
              list="clients-list"
              placeholder="Nome da empresa"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <datalist id="clients-list">
              {clients.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
            {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Solicitante</label>
            <input 
              {...register("requester")}
              list="requesters-list"
              placeholder="Quem solicitou"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <datalist id="requesters-list">
              {availableRequesters.map((r, idx) => (
                <option key={idx} value={r.name} />
              ))}
            </datalist>
            {errors.requester && <p className="text-red-500 text-xs mt-1">{errors.requester.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipamento / Máquina</label>
          <input 
            {...register("equipment")}
            placeholder="Ex: Prensa Hidráulica 02"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.equipment && <p className="text-red-500 text-xs mt-1">{errors.equipment.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tag do Equipamento</label>
            <input 
              {...register("equipmentTag")}
              placeholder="Ex: TAG-123"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Local / Setor</label>
            <input 
              {...register("equipmentLocation")}
              placeholder="Ex: Galpão A"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Encarregado de Manutenção</label>
          <input 
            {...register("supervisor")}
            placeholder="Nome do encarregado"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.supervisor && <p className="text-red-500 text-xs mt-1">{errors.supervisor.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora Inicial</label>
            <input 
              type="time"
              {...register("startTime")}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora Final</label>
            <input 
              type="time"
              {...register("endTime")}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Atividades Realizadas</label>
            <button 
              type="button" 
              onClick={addActivity}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar Atividade
            </button>
          </div>

          {activities.map((activity, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 relative group">
              {activities.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeActivity(index)}
                  className="absolute top-2 right-2 p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tipo</label>
                  <select 
                    {...register(`activities.${index}.type` as const)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="preventive">Preventiva</option>
                    <option value="corrective">Corretiva</option>
                    <option value="predictive">Preditiva</option>
                    <option value="inspection">Inspeção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
                  <select 
                    {...register(`activities.${index}.status` as const)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="completed">Concluído</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Descrição</label>
                <textarea 
                  {...register(`activities.${index}.description` as const)}
                  rows={2}
                  placeholder="O que foi feito?"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.activities?.[index]?.description && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.activities[index]?.description?.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Horas Ociosas</label>
            <button 
              type="button" 
              onClick={addIdleHour}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar Motivo
            </button>
          </div>

          {idleHours.map((idle, index) => (
            <div key={index} className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-3 relative group">
              <button 
                type="button"
                onClick={() => removeIdleHour(index)}
                className="absolute top-2 right-2 p-1 text-amber-400 dark:text-amber-600 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div>
                <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Motivo / Descrição</label>
                <input 
                  {...register(`idleHours.${index}.reason` as const)}
                  placeholder="Ex: Liberação de PT"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-200 dark:border-amber-900/30 focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                {errors.idleHours?.[index]?.reason && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.idleHours[index]?.reason?.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Início</label>
                  <input 
                    type="time"
                    {...register(`idleHours.${index}.startTime` as const)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-200 dark:border-amber-900/30 focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Fim</label>
                  <input 
                    type="time"
                    {...register(`idleHours.${index}.endTime` as const)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-200 dark:border-amber-900/30 focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400">
                  Subtotal: {formatDuration(calculateDuration(idle.startTime, idle.endTime))}
                </span>
              </div>
            </div>
          ))}

          {idleHours.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">Total Horas Ociosas</span>
              <span className="text-sm font-black text-amber-700 dark:text-amber-300">{formatDuration(totalIdleHours)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações Gerais</label>
          <textarea 
            {...register("observations")}
            rows={3}
            placeholder="Alguma observação adicional sobre a manutenção?"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Registros Fotográficos</label>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {photos.map((p, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden aspect-video group border border-slate-100 dark:border-slate-800">
                <img src={p} alt={`Evidência ${index + 1}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Tirar Foto</span>
            </button>
            
            <label className="py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer">
              <ImageIcon className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Galeria</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <SignaturePad 
            label="Assinatura Supervisão Cliente" 
            onSave={(sig) => setValue("clientSignature", sig)}
            initialValue={initialData?.clientSignature}
          />
          <SignaturePad 
            label="Assinatura Encarregado Manutenção" 
            onSave={(sig) => setValue("supervisorSignature", sig)}
            initialValue={initialData?.supervisorSignature}
          />
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
              Salvar Relatório
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
