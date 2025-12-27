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
import { logError } from '@/src/util/safe-logger';

const Dashboard = async () => {
  // PERF-002: バッチ化 - 3つのAPIを並列で呼び出し
  const [areasResult, accountsResult, unfulfilledResult] = await Promise.all([
    getAreas(),
    getAccountStatus(),
    getUnfulfilledCount(),
  ]);

  // CODE-013: エラー状態を追跡してUIに反映
  const areasError = isErrorResponse(areasResult);
  const accountsError = isErrorResponse(accountsResult);
  const unfulfilledError = isErrorResponse(unfulfilledResult);

  // エラー時はログ出力（API側でも出力されるが、ダッシュボード側でも集約ログとして出力）
  if (areasError) {
    logError('[Dashboard] areas取得失敗', areasResult.errors);
  }
  if (accountsError) {
    logError('[Dashboard] accounts取得失敗', accountsResult.errors);
  }
  if (unfulfilledError) {
    logError('[Dashboard] unfulfilled count取得失敗', unfulfilledResult.errors);
  }

  const areaNames: string[] = areasError ? [] : areasResult.map((area) => area.name);
  const members: MemberStatus[] = accountsError ? [] : accountsResult;
  const unfulfilledCount: number = unfulfilledError ? 0 : unfulfilledResult;

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
          <AreaChips areaNames={areaNames} error={areasError} />
          <Grid>
            <UploadButton areaNames={areaNames} error={areasError} />
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
                <Uncompletes
                  count={unfulfilledCount}
                  currentTime={currentTime}
                  error={unfulfilledError}
                />
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                square={false}
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Orders error={accountsError} members={members} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
