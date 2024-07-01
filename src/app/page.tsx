import { Toolbar } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import * as React from 'react';

import Copyright from '@/src/components/Copyright';
import ProTip from '@/src/components/ProTip';

import CommentList from '../components/CommentList';

export default function Home() {
  const account = {
    id: 10,
    name: 'admin',
    area: ['相模原'],
    role: 'admin',
    token: 'token',
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        component="main"
        sx={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '1500px',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              my: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" sx={{ mb: 2 }} variant="h4">
              Material UI - Next.js App Router example in TypeScript
            </Typography>
            <CommentList account={account} />
            <Link color="secondary" component={NextLink} href="/login">
              Go to the login page
            </Link>
            <ProTip />
            <Copyright />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
