'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Global Error:', error);
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#e11d48' }}>Algo deu errado!</h1>
          <p>Ocorreu um erro crítico no sistema.</p>
          <button 
            onClick={() => reset()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
