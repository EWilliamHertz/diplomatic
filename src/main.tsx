import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './styles.css';
import './i18n';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <App />
        </React.Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
