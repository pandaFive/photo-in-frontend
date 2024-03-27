import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import * as React from 'react';

import Copyright from '@/src/components/Copyright';
import ProTip from '@/src/components/ProTip';

export default function Home() {
  return (
    <Container maxWidth="lg">
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
        <Link color="secondary" component={NextLink} href="/about">
          Go to the about page
        </Link>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
