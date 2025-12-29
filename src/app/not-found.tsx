'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

/**
 * 404 Not Found ページ
 *
 * FEAT-001: カスタム404ページの実装
 *
 * Next.js App Routerの規約により、存在しないルートへのアクセス時に
 * 自動的に表示される。ホームページへの導線を提供。
 */
const NotFound = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f7fa',
        px: 2,
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '6rem', md: '8rem' },
          fontWeight: 700,
          color: '#667eea',
          mb: 2,
        }}
        variant="h1"
      >
        404
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
          mb: 4,
          textAlign: 'center',
        }}
        variant="h5"
      >
        お探しのページが見つかりませんでした
      </Typography>
      <Button
        component={Link}
        href="/"
        size="large"
        sx={{
          bgcolor: '#667eea',
          '&:hover': {
            bgcolor: '#5a6fd6',
          },
          borderRadius: 2,
          px: 4,
          py: 1.5,
        }}
        variant="contained"
      >
        ホームに戻る
      </Button>
    </Box>
  );
};

export default NotFound;
