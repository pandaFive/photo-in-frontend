import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import * as React from 'react';

import { getAccountStatus } from '@/src/api/get-account-status';
import { getAreas } from '@/src/api/get-areas';
import { getUnfulfilledCount } from '@/src/api/get-unfulfilled-count';
import AreaChips from '@/src/components/AreaChips';
import UploadButton from '@/src/components/Buttons/UploadButton';
import Chart from '@/src/components/Chart';
import Orders from '@/src/components/Orders';
import Uncompletes from '@/src/components/Uncompletes';
import { formatDateToEnglish } from '@/src/domain/functions/date';
import { getNow } from '@/src/infra/time';
import { isErrorResponse, MemberStatus } from '@/src/types';

const Dashboard = async () => {
  // PERF-002: バッチ化 - 3つのAPIを並列で呼び出し
  const [areasResult, accountsResult, unfulfilledResult] = await Promise.all([
    getAreas(),
    getAccountStatus(),
    getUnfulfilledCount(),
  ]);

  const areaNames: string[] = isErrorResponse(areasResult)
    ? []
    : areasResult.map((area) => area.name);

  const members: MemberStatus[] = isErrorResponse(accountsResult)
    ? []
    : accountsResult;

  const unfulfilledCount: number =
    typeof unfulfilledResult === 'number' ? unfulfilledResult : 0;

  const currentTime = formatDateToEnglish(getNow());
  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Box
        component="main"
        sx={{
          bgcolor: '#f5f7fa',
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <AreaChips areaNames={areaNames} />
          <Grid>
            <UploadButton areaNames={areaNames} />
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
                <Uncompletes count={unfulfilledCount} currentTime={currentTime} />
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                square={false}
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Orders members={members} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
