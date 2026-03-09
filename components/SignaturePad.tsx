'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onSave: (signature: string) => void;
  initialValue?: string;
}

export default function SignaturePad({ label, onSave, initialValue }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(!!initialValue);

  const clear = () => {
    sigCanvas.current?.clear();
    setHasSignature(false);
    onSave('');
  };

  const save = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setHasSignature(true);
      onSave(data);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-40 cursor-crosshair bg-white",
          }}
          onEnd={save}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 rounded-lg hover:text-red-500 transition-colors"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>
      {hasSignature && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
          <Check className="w-3 h-3" /> Assinatura capturada
        </p>
      )}
    </div>
  );
}
