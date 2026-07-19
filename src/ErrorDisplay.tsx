import React, { useEffect, useState } from 'react';

export function ErrorDisplay({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleErr = (e: ErrorEvent) => {
      const msg = e.message || '';
      if (msg.includes('WebSocket closed') || msg.includes('failed to connect to websocket')) {
          return;
      }
      setError(e.message + "\n" + e.error?.stack);
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      const reasonStr = e.reason ? String(e.reason) : '';
      if (reasonStr.includes('WebSocket closed') || reasonStr.includes('failed to connect to websocket')) {
          console.warn('Ignored benign WebSocket error:', e.reason);
          return;
      }
      setError("Unhandled Promise Rejection: " + e.reason);
    };
    window.addEventListener('error', handleErr);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleErr);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', background: 'red', color: 'white', zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0 }}>
        <h2>Runtime Error Caught</h2>
        <pre>{error}</pre>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }
  return <>{children}</>;
}
