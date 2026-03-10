import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6 text-center">
      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">404</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Página não encontrada ou em construção.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
