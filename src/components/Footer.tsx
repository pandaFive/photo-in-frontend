import { Box, Typography } from '@mui/material';
import React from 'react';

import { getCurrentYear } from '@/src/infra/time';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        bgcolor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        align="center"
        color="text.secondary"
        sx={{ fontSize: '0.875rem' }}
      >
        © {getCurrentYear()} PHOTO IN. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
