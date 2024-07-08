'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Gauge } from '@mui/x-charts';

type Props = {
  name: string;
  rate: number;
  size: number;
};

const CircleRate = (props: Props) => {
  return (
    <Paper>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography>{props.name}</Typography>
        <Gauge height={props.size} value={props.rate} width={props.size} />
      </Box>
    </Paper>
  );
};

export default CircleRate;
