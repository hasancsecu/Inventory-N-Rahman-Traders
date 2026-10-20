'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let listeners: ToastListener[] = [];
let activeToasts: ToastItem[] = [];

function emit() {
  for (const listener of listeners) {
    listener([...activeToasts]);
  }
}

export const toast = {
  show: (
    message: string,
    type: ToastType = 'info',
    options?: { title?: string; duration?: number }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = {
      id,
      type,
      title: options?.title,
      message,
      duration: options?.duration ?? 4500,
    };
    activeToasts = [...activeToasts, item];
    emit();
    return id;
  },
  success: (message: string, options?: { title?: string; duration?: number }) => {
    return toast.show(message, 'success', options);
  },
  error: (message: string, options?: { title?: string; duration?: number }) => {
    return toast.show(message, 'error', options);
  },
  warning: (message: string, options?: { title?: string; duration?: number }) => {
    return toast.show(message, 'warning', options);
  },
  info: (message: string, options?: { title?: string; duration?: number }) => {
    return toast.show(message, 'info', options);
  },
  dismiss: (id: string) => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    emit();
  },
  clear: () => {
    activeToasts = [];
    emit();
  },
};

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, item.duration ?? 4500);
    return () => clearTimeout(timer);
  }, [paused, item.duration, onDismiss]);

  const styleConfig = {
    success: {
      border: 'border-emerald-500/40 dark:border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/10',
      icon: CheckCircle2,
      defaultTitle: 'Success',
      accentBar: 'bg-emerald-500',
    },
    error: {
      border: 'border-rose-500/40 dark:border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      glow: 'shadow-rose-500/15',
      icon: AlertCircle,
      defaultTitle: 'Error Alert',
      accentBar: 'bg-rose-500',
    },
    warning: {
      border: 'border-amber-500/40 dark:border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glow: 'shadow-amber-500/10',
      icon: AlertTriangle,
      defaultTitle: 'Warning',
      accentBar: 'bg-amber-500',
    },
    info: {
      border: 'border-sky-500/40 dark:border-sky-500/30',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      glow: 'shadow-sky-500/10',
      icon: Info,
      defaultTitle: 'Notification',
      accentBar: 'bg-sky-500',
    },
  }[item.type];

  const Icon = styleConfig.icon;
  const title = item.title || styleConfig.defaultTitle;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="alert"
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border ${styleConfig.border} shadow-xl ${styleConfig.glow} transition-all animate-in fade-in slide-in-from-bottom-3 duration-200`}
    >
      {/* Accent left highlight bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${styleConfig.accentBar}`} />

      {/* Type Icon Badge */}
      <div className={`p-1.5 rounded-xl border ${styleConfig.badge} shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Message and Title */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
          <span>{title}</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed break-words">
          {item.message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>(activeToasts);

  React.useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => setItems(updated);
    listeners.push(handleUpdate);
    return () => {
      listeners = listeners.filter((l) => l !== handleUpdate);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {items.map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onDismiss={() => toast.dismiss(item.id)}
        />
      ))}
    </div>
  );
}
