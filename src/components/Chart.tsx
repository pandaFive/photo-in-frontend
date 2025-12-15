'use client';
import { useTheme } from '@mui/material/styles';
import { LineChart, axisClasses } from '@mui/x-charts';
import { ChartsTextStyle } from '@mui/x-charts/ChartsText';
import * as React from 'react';

import { getWeekComplete } from '@/src/api/get-week-complete';
import Title from '@/src/components/Title';
import { getDatesForPastWeek } from '@/src/domain/functions/date';
import { getNow } from '@/src/infra/time';

const Y_AXIS_PADDING = 5; // Y軸の最大値に追加する余白
const DEFAULT_MAX_VALUE = 10; // デフォルトの最大値

interface Data {
  date: string;
  amount: number | null;
}

function createData(date: string, amount: number | null): Data {
  return { date, amount };
}

const Chart = () => {
  const [data, setData] = React.useState<Data[]>([]);
  const [max, setMax] = React.useState<number>(DEFAULT_MAX_VALUE);
  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWeekComplete();
        const datesForPastWeek: string[] = getDatesForPastWeek(getNow());

        // データの変換（副作用なし）
        const newData: Data[] = datesForPastWeek.map((dateString) => {
          const amount = response[dateString] ? (response[dateString] as number) : 0;
          return createData(dateString, amount);
        });

        // データから最大値を計算
        const maxAmount = Math.max(...newData.map((d) => d.amount ?? 0));
        const newMax = maxAmount > 0 ? maxAmount + Y_AXIS_PADDING : DEFAULT_MAX_VALUE;

        setData(newData);
        setMax(newMax);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    void fetchData();
  }, []); // 依存配列からmaxを削除し、初回マウント時のみ実行

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
              max: max,
              tickNumber: 5,
            },
          ]}
        />
      </div>
    </React.Fragment>
  );
};

export default Chart;
