'use client';

import { Alert, Box, Button, Snackbar } from '@mui/material';
import { useEffect } from 'react';

import { useToast, Toast as ToastType } from '@/src/context/ToastContext';

type ToastItemProps = {
  toast: ToastType;
  index: number;
  onClose: () => void;
};

const ToastItem = ({ toast, index, onClose }: ToastItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const handleRetry = () => {
    if (toast.onRetry) {
      toast.onRetry();
      onClose();
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={true}
      sx={{
        bottom: `${24 + index * 64}px !important`,
      }}
    >
      <Alert
        action={
          toast.onRetry ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                onClick={handleRetry}
                size="small"
                sx={{ fontWeight: 'bold' }}
              >
                再試行
              </Button>
            </Box>
          ) : undefined
        }
        onClose={onClose}
        severity={toast.type}
        sx={{ width: '100%', minWidth: '300px' }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast, index) => (
        <ToastItem
          index={index}
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          toast={toast}
        />
      ))}
    </>
  );
};
