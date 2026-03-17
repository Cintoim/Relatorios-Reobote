'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, 
  Edit3, 
  Wrench, 
  User, 
  Building2, 
  UserCircle, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  Trash2,
  AlertTriangle,
  Download,
  Loader2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// import jsPDF from 'jspdf'; // Removed for SSR compatibility
// import { UserOptions } from 'jspdf-autotable'; // Removed for SSR compatibility
import { Report } from './ReportForm';

// Type definition for jsPDF with autoTable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type jsPDFWithAutoTable = any;

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { icon: React.ElementType, color: string, label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', label: 'Concluído' },
  in_progress: { icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-100', label: 'Em Andamento' },
  pending: { icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-100', label: 'Pendente' },
};

const typeLabels: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  predictive: 'Preditiva',
  inspection: 'Inspeção',
};

export default function ReportDetail({ report, onClose, onEdit, onDelete }: ReportDetailProps) {
  const [deleteStage, setDeleteStage] = React.useState(0);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'generating' | 'sharing' | 'error'>('idle');

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generatePDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Header Background Gradient (Blue to Green) with Opacity
    const startColor = [0, 51, 102]; // Azul Escuro
    const endColor = [34, 197, 94];   // Verde
    const headerHeight = 35;
    
    // Set opacity for the background
    doc.saveGraphicsState();
    doc.setGState(new (doc as jsPDFWithAutoTable).GState({ opacity: 0.9 })); 
    
    const steps = 70; // More steps for a smoother gradient
    const stepHeight = headerHeight / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.floor(startColor[0] * (1 - ratio) + endColor[0] * ratio);
      const g = Math.floor(startColor[1] * (1 - ratio) + endColor[1] * ratio);
      const b = Math.floor(startColor[2] * (1 - ratio) + endColor[2] * ratio);
      doc.setFillColor(r, g, b);
      // Use rect with a tiny overlap to avoid "cracked" look
      doc.rect(0, i * stepHeight, 210, stepHeight + 0.2, 'F');
    }
    doc.restoreGraphicsState();

    // Header - Empresa
    const name = 'Reobote Mult-Service';
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const nameWidth = doc.getTextWidth(name);
    const centerX = 105;
    const nameY = 18;
    doc.text(name, centerX, nameY, { align: 'center' });
    
    // Gear Icon
    const gearX = centerX - (nameWidth / 2) - 12;
    const gearY = nameY - 4;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(gearX, gearY, 3, 'S');
    for (let a = 0; a < 360; a += 45) {
      const rad = a * Math.PI / 180;
      doc.line(
        gearX + Math.cos(rad) * 3, 
        gearY + Math.sin(rad) * 3, 
        gearX + Math.cos(rad) * 4.5, 
        gearY + Math.sin(rad) * 4.5
      );
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('aprimorando idéias, gerando soluções', centerX, 26, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Rua Turmalina, 163 - Sorriso-MT | (66) 99632-5747 | jader.reobote@outlook.com', centerX, 31, { align: 'center' });

    // Título do Relatório
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE MANUTENÇÃO', 105, 42, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${format(new Date(report.date), "dd/MM/yyyy HH:mm")}`, 105, 48, { align: 'center' });

    // Info Section
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações Gerais', 14, 60);
    
    autoTable(doc, {
      startY: 65,
      head: [['Campo', 'Valor']],
      body: [
        ['Cliente', report.client],
        ['Solicitante', `${report.requester}${report.requesterEmail ? ` (${report.requesterEmail})` : ''}${report.requesterContact ? ` - ${report.requesterContact}` : ''}`],
        ['Equipamento', report.equipment],
        ['Tag', report.equipmentTag || '-'],
        ['Local', report.equipmentLocation || '-'],
        ['Horário', `${report.startTime || '08:00'} às ${report.endTime || '17:00'}`],
        ['Encarregado', report.supervisor],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102] }
    });

    // Activities Section
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.text('Atividades Realizadas', 14, finalY + 15);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Tipo', 'Status', 'Descrição']],
      body: report.activities.map(act => [
        typeLabels[act.type],
        statusConfig[act.status].label,
        act.description
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102] }
    });

    // Idle Hours Section
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    if (report.idleHours && report.idleHours.length > 0) {
      doc.text('Horas Ociosas', 14, currentY);
      
      const calculateDuration = (start: string, end: string) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        return diff > 0 ? diff / 60 : 0;
      };

      const totalIdle = report.idleHours.reduce((acc, curr) => acc + calculateDuration(curr.startTime, curr.endTime), 0);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Motivo', 'Início', 'Fim', 'Duração']],
        body: [
          ...report.idleHours.map(idle => [
            idle.reason,
            idle.startTime,
            idle.endTime,
            formatDuration(calculateDuration(idle.startTime, idle.endTime))
          ]),
          [{ content: 'TOTAL', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: formatDuration(totalIdle), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      currentY += 0;
    }

    // Observations Section in PDF
    if (report.observations) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text('Observações Gerais', 14, currentY);
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const splitObs = doc.splitTextToSize(report.observations, 180);
      doc.text(splitObs, 14, currentY + 7);
      currentY += (splitObs.length * 5) + 15;
    }

    // Photos
    currentY = Math.max(currentY, ((doc as any).lastAutoTable?.finalY || 0) + 15);
    const allPhotos = report.photos || (report.photo ? [report.photo] : []);
    
    if (allPhotos.length > 0) {
      doc.text('Registros Fotográficos', 14, currentY);
      currentY += 10;

      allPhotos.forEach((photo) => {
        if (currentY > 180) {
          doc.addPage();
          currentY = 20;
          doc.text('Registros Fotográficos (cont.)', 14, currentY);
          currentY += 10;
        }
        
        try {
          doc.addImage(photo, 'JPEG', 14, currentY, 180, 100);
          currentY += 110;
        } catch (e) {
          console.error("Error adding image to PDF", e);
        }
      });
    }

    // Signatures
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(10);
    if (report.clientSignature) {
      doc.text('__________________________', 40, currentY + 30);
      doc.text('Supervisão Cliente', 40, currentY + 35);
      doc.addImage(report.clientSignature, 'PNG', 40, currentY + 10, 50, 20);
    }

    if (report.supervisorSignature) {
      doc.text('__________________________', 130, currentY + 30);
      doc.text('Encarregado Manutenção', 130, currentY + 35);
      doc.addImage(report.supervisorSignature, 'PNG', 130, currentY + 10, 50, 20);
    }

    return doc;
  };

  const shareToWhatsApp = async () => {
    try {
      setShareStatus('generating');
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const doc = await generatePDF();
      const pdfBlob = doc.output('blob');
      const fileName = `Relatorio_${report.equipment.replace(/\s+/g, '_')}_${format(new Date(report.date), "ddMMyyyy")}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      setShareStatus('sharing');

      // Try to use Web Share API if available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Relatório de Manutenção',
            text: `Relatório de Manutenção - ${report.equipment} - ${report.client}`,
          });
          setShareStatus('idle');
          return;
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error sharing:', error);
          } else {
            setShareStatus('idle');
            return; // User cancelled
          }
        }
      }

      // Fallback: Open WhatsApp with message (skipping file download if it causes crashes on some mobile webviews)
      const message = `Olá! Segue o Relatório de Manutenção do equipamento ${report.equipment}.\n\nCliente: ${report.client}\nData: ${format(new Date(report.date), "dd/MM/yyyy")}\nStatus: ${report.activities.every(a => a.status === 'completed') ? 'Concluído' : 'Em Andamento'}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      
      // Try to download as well, but wrap it to prevent total crash if possible
      try {
        doc.save(fileName);
      } catch (downloadErr) {
        console.error('Download fallback error:', downloadErr);
      }

      // Open WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      setShareStatus('idle');
    } catch (err) {
      console.error('PDF Generation/Sharing Error:', err);
      setShareStatus('error');
      alert('Ocorreu um erro ao gerar ou compartilhar o PDF. Por favor, tente novamente.');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsGenerating(true);
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const doc = await generatePDF();
      const fileName = `Relatorio_${report.equipment.replace(/\s+/g, '_')}_${format(new Date(report.date), "ddMMyyyy")}.pdf`;
      
      // Use doc.save() which is more robust in many environments than manual blob creation
      doc.save(fileName);
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Download Error:', err);
      setIsGenerating(false);
      alert('Erro ao baixar o PDF. Tente compartilhar ou abrir em uma nova aba.');
    }
  };

  const viewPDF = async () => {
    try {
      const doc = await generatePDF();
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('View PDF Error:', err);
      alert('Erro ao visualizar o PDF.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Detalhes do Relatório</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={viewPDF}
            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Visualizar PDF"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={downloadPDF}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Baixar PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setDeleteStage(1)}
            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={shareToWhatsApp}
            className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEdit(report)}
            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Main Info Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{report.equipment}</h3>
              {(report.equipmentTag || report.equipmentLocation) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {report.equipmentTag && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      TAG: {report.equipmentTag}
                    </span>
                  )}
                  {report.equipmentLocation && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      LOCAL: {report.equipmentLocation}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mt-1.5">
                <Calendar className="w-3 h-3" />
                {format(new Date(report.date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
              {(report.startTime || report.endTime) && (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                  <Clock className="w-3 h-3" />
                  {report.startTime || '08:00'} às {report.endTime || '17:00'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Cliente
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.client}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <UserCircle className="w-3 h-3" /> Solicitante
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.requester}</p>
              {(report.requesterEmail || report.requesterContact) && (
                <div className="mt-1 space-y-0.5">
                  {report.requesterEmail && <p className="text-[10px] text-slate-400 dark:text-slate-500">{report.requesterEmail}</p>}
                  {report.requesterContact && <p className="text-[10px] text-slate-400 dark:text-slate-500">{report.requesterContact}</p>}
                </div>
              )}
            </div>
            <div className="space-y-1 col-span-2 mt-4">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3 h-3" /> Encarregado
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.supervisor}</p>
            </div>
          </div>
        </section>

        {/* Activities Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Atividades Realizadas</h4>
          <div className="space-y-3">
            {report.activities.map((activity, index) => {
              const status = statusConfig[activity.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase border border-slate-100 dark:border-slate-700">
                      {typeLabels[activity.type]}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color.replace('bg-', 'dark:bg-').replace('text-', 'dark:text-').replace('border-', 'dark:border-')}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Idle Hours Section */}
        {report.idleHours && report.idleHours.length > 0 && (
          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Horas Ociosas</h4>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 overflow-hidden">
              <div className="p-4 space-y-3">
                {report.idleHours.map((idle, index) => {
                  const [startH, startM] = idle.startTime.split(':').map(Number);
                  const [endH, endM] = idle.endTime.split(':').map(Number);
                  const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
                  
                  return (
                    <div key={index} className="flex items-start justify-between gap-4 pb-3 border-b border-amber-100 dark:border-amber-900/30 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{idle.reason}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Das {idle.startTime} às {idle.endTime}</p>
                      </div>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 whitespace-nowrap">{formatDuration(duration)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-3 flex justify-between items-center">
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">Total Ocioso</span>
                <span className="text-sm font-black text-amber-800 dark:text-amber-300">
                  {formatDuration(report.idleHours.reduce((acc, curr) => {
                    const [sH, sM] = curr.startTime.split(':').map(Number);
                    const [eH, eM] = curr.endTime.split(':').map(Number);
                    return acc + ((eH * 60 + eM) - (sH * 60 + sM)) / 60;
                  }, 0))}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Local / Setor Section (Replaced Observations as requested) */}
        {report.equipmentLocation && (
          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Local / Setor</h4>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                {report.equipmentLocation}
              </p>
            </div>
          </section>
        )}

        {/* Photo Evidence */}
        {((report.photos && report.photos.length > 0) || report.photo) && (
          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Registros Fotográficos</h4>
            <div className="grid grid-cols-1 gap-4">
              {(report.photos || (report.photo ? [report.photo] : [])).map((p, idx) => (
                <div key={idx} className="rounded-3xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
                  <img src={p} alt={`Evidência ${idx + 1}`} className="w-full h-auto" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Signatures Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Assinaturas Digitais</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="h-20 flex items-center justify-center mb-2">
                {report.clientSignature ? (
                  <img src={report.clientSignature} alt="Assinatura Cliente" className="max-h-full dark:invert" />
                ) : (
                  <div className="text-[10px] text-slate-300 dark:text-slate-600 italic">Não assinada</div>
                )}
              </div>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase border-t border-slate-50 dark:border-slate-800 pt-2">Supervisão Cliente</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="h-20 flex items-center justify-center mb-2">
                {report.supervisorSignature ? (
                  <img src={report.supervisorSignature} alt="Assinatura Encarregado" className="max-h-full dark:invert" />
                ) : (
                  <div className="text-[10px] text-slate-300 dark:text-slate-600 italic">Não assinada</div>
                )}
              </div>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase border-t border-slate-50 dark:border-slate-800 pt-2">Encarregado Manut.</div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 relative">
        {(isGenerating || shareStatus !== 'idle') && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isGenerating ? 'Baixando PDF...' : 
               shareStatus === 'generating' ? 'Gerando PDF...' : 
               shareStatus === 'sharing' ? 'Abrindo compartilhamento...' : 
               shareStatus === 'error' ? 'Erro ao processar' : ''}
            </span>
          </div>
        )}
        <button 
          onClick={shareToWhatsApp}
          disabled={isGenerating || shareStatus !== 'idle'}
          className="py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 dark:shadow-none active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar PDF
        </button>
        <button 
          onClick={() => onEdit(report)}
          disabled={isGenerating || shareStatus !== 'idle'}
          className="py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Edit3 className="w-5 h-5" />
          Editar
        </button>
      </div>
      {/* Delete Confirmation Overlays */}
      <AnimatePresence>
        {deleteStage === 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Excluir Relatório?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Esta ação irá remover permanentemente este relatório de manutenção.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setDeleteStage(2)}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  Sim, Excluir
                </button>
                <button 
                  onClick={() => setDeleteStage(0)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteStage === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-red-600 flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center text-white"
            >
              <AlertTriangle className="w-20 h-20 mx-auto mb-6 animate-bounce" />
              <h3 className="text-2xl font-black mb-4">CONFIRMAÇÃO FINAL</h3>
              <p className="text-red-100 mb-12 font-medium">Tem certeza absoluta? Esta ação não pode ser desfeita e os dados serão perdidos para sempre.</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => onDelete(report.id)}
                  className="w-full py-5 bg-white text-red-600 rounded-2xl font-black text-lg shadow-2xl active:scale-[0.95] transition-all"
                >
                  CONFIRMAR EXCLUSÃO
                </button>
                <button 
                  onClick={() => setDeleteStage(0)}
                  className="text-white/80 font-bold py-4"
                >
                  VOLTAR E CANCELAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
