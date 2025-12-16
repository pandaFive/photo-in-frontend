'use client';
import { useTheme } from '@mui/material/styles';
import { LineChart, axisClasses } from '@mui/x-charts';
import { ChartsTextStyle } from '@mui/x-charts/ChartsText';
import * as React from 'react';

import Title from '@/src/components/Title';
import { useWeekComplete } from '@/src/queries';

const DEFAULT_MAX_VALUE = 10;

const Chart = () => {
  const theme = useTheme();
  const { data, max, isLoading, error } = useWeekComplete();

  if (error) {
    return (
      <React.Fragment>
        <Title>week&apos;s</Title>
        <div style={{ color: 'red' }}>{error}</div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Title>week&apos;s</Title>
      <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        <LineChart
          dataset={data}
          margin={{
            top: 16,
            right: 24,
            left: 70,
            bottom: 30,
          }}
          series={[
            {
              curve: 'linear',
              dataKey: 'amount',
              showMark: true,
              color: theme.palette.primary.light,
            },
          ]}
          sx={{
            [`.${axisClasses.root} line`]: {
              stroke: theme.palette.text.secondary,
            },
            [`.${axisClasses.root} text`]: {
              fill: theme.palette.text.secondary,
            },
            [`& .${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translateX(-25px)',
            },
          }}
          xAxis={[
            {
              scaleType: 'point',
              dataKey: 'date',
              tickNumber: 2,
              tickLabelStyle: {
                ...(theme.typography.body2 as ChartsTextStyle),
              },
            },
          ]}
          yAxis={[
            {
              label: '完了数',
              labelStyle: {
                ...(theme.typography.body1 as ChartsTextStyle),
                fill: theme.palette.text.primary,
                writingMode: 'vertical-rl',
                transform: 'revert',
              },
              tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
              max: isLoading ? DEFAULT_MAX_VALUE : max,
              tickNumber: 5,
            },
          ]}
        />
      </div>
    </React.Fragment>
  );
};

export default Chart;
