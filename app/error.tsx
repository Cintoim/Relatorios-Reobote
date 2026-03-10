'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Algo deu errado!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Ocorreu um erro inesperado no aplicativo.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
