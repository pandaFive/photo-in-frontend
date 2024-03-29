import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export default function Copyright() {
  return (
    <Typography align="center" color="text.secondary" variant="body2">
      {'Copyright © '}
      <MuiLink color="inherit" href="https://mui.com/">
        Your Website
      </MuiLink>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
