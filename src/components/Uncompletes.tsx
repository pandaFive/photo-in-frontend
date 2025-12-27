import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Button, Typography } from '@mui/material';
import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';
import * as React from 'react';

type Props = {
  count: number;
  currentTime: string;
  error?: boolean;
};

const Uncompletes = ({ count, currentTime, error = false }: Props) => {
  return (
    <React.Fragment>
      <Typography component="p" sx={{ flex: 1 }} variant="h5">
        非達成件数
      </Typography>
      {error ? (
        <Alert
          action={
            <Button
              color="inherit"
              component={NextLink}
              href="/dashboard"
              size="small"
              startIcon={<RefreshIcon />}
            >
              再読み込み
            </Button>
          }
          severity="error"
          sx={{ mt: 1, flex: 1 }}
        >
          非達成件数の取得に失敗しました。
        </Alert>
      ) : (
        <Typography component="p" sx={{ flex: 1 }} variant="h4">
          {count}件
        </Typography>
      )}
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on {currentTime}
      </Typography>
      <div>
        <MuiLink color="primary" href="/task">
          View more
        </MuiLink>
      </div>
    </React.Fragment>
  );
};

export default Uncompletes;
