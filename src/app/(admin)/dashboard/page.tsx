import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import * as React from 'react';

import AreaChips from '@/src/components/AreaChips';
import UploadButton from '@/src/components/Buttons/UploadButton';
import Chart from '@/src/components/Chart';
import Orders from '@/src/components/Orders';
import Uncompletes from '@/src/components/Uncompletes';

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="main"
        sx={{
          backgroundColor: '#f9f9f9',
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <AreaChips />
          <Grid>
            <UploadButton />
          </Grid>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item lg={9} md={8} xs={12}>
              <Paper
                elevation={2}
                square={false}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Chart />
              </Paper>
            </Grid>
            {/* Recent Uncompletes */}
            <Grid item lg={3} md={4} xs={12}>
              <Paper
                elevation={2}
                square={false}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Uncompletes />
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                square={false}
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Orders />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
