'use client';

import { motion } from 'motion/react';

// Forced update to resolve chunk 404
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center p-4 text-center"
    >
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <button
        onClick={() => reset()}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Tentar novamente
      </button>
    </motion.div>
  );
}
