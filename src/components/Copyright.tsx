import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { getCurrentYear } from '@/src/infra/time';

export default function Copyright() {
  return (
    <Typography align="center" color="text.secondary" variant="body2">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://mui.com/">
        Your Website
      </MuiLink>{' '}
      {getCurrentYear()}.
    </Typography>
  );
}
