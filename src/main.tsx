import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
import App from './App.tsx';
import { ErrorDisplay } from './ErrorDisplay';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logSystemEvent } from './lib/logSystemEvent';

// Global error handlers
window.addEventListener('error', (event) => {
  logSystemEvent('error', `Global Error: ${event.message}`, event.error?.stack, window.location.pathname);
});
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason ? String(event.reason) : '';
  if (reasonStr.includes('WebSocket closed') || reasonStr.includes('failed to connect to websocket')) {
      return; // Ignore benign websocket reconnect errors
  }
  logSystemEvent('error', `Unhandled Promise Rejection`, event.reason, window.location.pathname);
});

let isLoggingConsole = false;
const loggedMessages = new Set<string>();

// Intercept console.error to catch React warnings like missing keys
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  if (isLoggingConsole) return;
  const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  if (message.includes('WebSocket closed') || message.includes('failed to connect to websocket')) return;
  
  if (loggedMessages.has(message)) return;
  loggedMessages.add(message);
  
  isLoggingConsole = true;
  logSystemEvent('error', `Console Error: ${message.substring(0, 200)}`, message, window.location.pathname)
    .finally(() => { 
        setTimeout(() => { isLoggingConsole = false; }, 1000);
    });
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  originalConsoleWarn(...args);
  if (isLoggingConsole) return;
  const message = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
  
  if (loggedMessages.has(message)) return;
  loggedMessages.add(message);
  
  isLoggingConsole = true;
  logSystemEvent('warning', `Console Warn: ${message.substring(0, 200)}`, message, window.location.pathname)
    .finally(() => { 
        setTimeout(() => { isLoggingConsole = false; }, 1000);
    });
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorDisplay><App /></ErrorDisplay>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
