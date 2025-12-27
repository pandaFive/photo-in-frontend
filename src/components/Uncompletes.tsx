import { Alert, Typography } from '@mui/material';
import Link from '@mui/material/Link';
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
        <Alert severity="error" sx={{ mt: 1, flex: 1 }}>
          取得失敗
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
        <Link color="primary" href="/task">
          View more
        </Link>
      </div>
    </React.Fragment>
  );
};

export default Uncompletes;
