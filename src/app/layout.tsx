import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Suspense } from 'react';

import Header from '@/src/components/Header';
import { ToastContainer } from '@/src/components/Toast';
import { ToastProvider } from '@/src/context/ToastContext';

import theme from '../theme';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'PHOTO IN | 撮影タスク自動割り振り',
  description: '撮影タスクを自動割り振りするスマートなアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <CssBaseline />
              <Box
                sx={{
                  display: 'flex',
                  minHeight: '100vh',
                  bgcolor: 'background.default',
                }}
              >
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
                <Suspense fallback={null}>{children}</Suspense>
              </Box>
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
