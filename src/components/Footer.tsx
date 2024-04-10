import Typography from '@mui/material/Typography';
import Link from 'next/link';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <Typography
      align="center"
      color="text.secondary"
      marginBottom={2}
      variant="body2"
    >
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

export default Footer;
