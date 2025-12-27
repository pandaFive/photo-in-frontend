import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import * as React from 'react';

type Props = {
  count: number;
  currentTime: string;
};

const Uncompletes = ({ count, currentTime }: Props) => {
  return (
    <React.Fragment>
      <Typography component="p" sx={{ flex: 1 }} variant="h5">
        非達成件数
      </Typography>
      <Typography component="p" sx={{ flex: 1 }} variant="h4">
        {count}件
      </Typography>
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
