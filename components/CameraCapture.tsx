'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold uppercase tracking-widest">Capturar Evidência</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <button onClick={onClose} className="px-6 py-2 bg-white text-black rounded-full font-bold">Voltar</button>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captura" className="w-full h-full object-contain" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      <div className="p-8 flex items-center justify-center gap-8 bg-black/50 backdrop-blur-md">
        {capturedImage ? (
          <>
            <button 
              onClick={() => setCapturedImage(null)}
              className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white"
            >
              <RefreshCw className="w-8 h-8" />
            </button>
            <button 
              onClick={confirmPhoto}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20"
            >
              <Check className="w-10 h-10" />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white"
            >
              <ImageIcon className="w-8 h-8" />
            </button>
            <button 
              onClick={takePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl"
            >
              <div className="w-16 h-16 border-4 border-black/5 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-black" />
              </div>
            </button>
            <div className="w-16" /> {/* Spacer to balance layout */}
          </>
        )}
      </div>
    </div>
  );
}
