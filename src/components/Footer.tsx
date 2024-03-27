import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <AppBar
      component="footer"
      position="absolute"
      sx={{
        backgroundColor: '#000000',
        bottom: 0,
        height: '2rem',
        marginTop: 'auto',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption">&copy;2024 propan</Typography>
        </Box>
      </Container>
    </AppBar>
  );
};

export default Footer;
