import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toast Container */}
      <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none animate-fadeIn">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
          const bg = isSuccess 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10' 
            : isError 
            ? 'bg-red-950/90 border-red-500/40 text-red-200 shadow-red-500/10' 
            : 'bg-blue-950/90 border-blue-500/40 text-blue-200 shadow-blue-500/10';
          const iconColor = isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-blue-400';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-scaleIn ${bg}`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0 text-xs font-bold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 opacity-70 hover:opacity-100" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
