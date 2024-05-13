'use client';
import { Typography } from '@mui/material';
import Link from '@mui/material/Link';
import * as React from 'react';

import { getUnfulfilledCount } from '@/src/api/get-unfulfilled-count';

import getCurrentTime from '../util/get-current-time';

const Uncompletes = () => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUnfulfilledCount();
        if (typeof response === 'number') {
          setCount(response);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    void fetchData();
  }, []);

  return (
    <React.Fragment>
      <Typography component="p" sx={{ flex: 1 }} variant="h5">
        非達成件数
      </Typography>
      <Typography component="p" sx={{ flex: 1 }} variant="h4">
        {count}件
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on {getCurrentTime()}
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
