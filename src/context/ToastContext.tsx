'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  onRetry?: () => void;
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showErrorWithRetry: (message: string, onRetry: () => void) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;

let toastIdCounter = 0;

const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}-${Date.now()}`;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = generateToastId();
      const toastDuration =
        duration ?? (type === 'error' ? ERROR_DURATION : DEFAULT_DURATION);

      const newToast: Toast = {
        id,
        message,
        type,
        duration: toastDuration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast],
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast],
  );

  const showErrorWithRetry = useCallback(
    (message: string, onRetry: () => void) => {
      const id = generateToastId();
      const newToast: Toast = {
        id,
        message,
        type: 'error',
        duration: ERROR_DURATION,
        onRetry,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      showError,
      showSuccess,
      showErrorWithRetry,
      removeToast,
    }),
    [toasts, showToast, showError, showSuccess, showErrorWithRetry, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
