'use client';
import { Box, Skeleton } from '@mui/material';

/**
 * OPT-002: Chart用ローディングスケルトン
 * CLSを防ぐため、親コンテナに合わせて領域を確保
 */
const ChartSkeleton = () => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}
    >
      <Skeleton height={24} sx={{ mb: 1 }} variant="text" width="30%" />
      <Skeleton sx={{ flexGrow: 1 }} variant="rectangular" width="100%" />
    </Box>
  );
};

export default ChartSkeleton;
