'use client';
import { useTheme } from '@mui/material/styles';
import { LineChart, axisClasses } from '@mui/x-charts';
import { ChartsTextStyle } from '@mui/x-charts/ChartsText';
import * as React from 'react';

import { getWeekComplete } from '@/src/api/get-week-complete';
import Title from '@/src/components/Title';

interface Data {
  date: string;
  amount: number | null;
}

function createData(date: string, amount: number | null): Data {
  return { date, amount };
}

function getDatesForPastWeek(): string[] {
  const dates: string[] = [];
  const today: Date = new Date();
  const oneDayMs: number = 24 * 60 * 60 * 1000; // 1日のミリ秒数

  // 1週間前の日付を取得
  const oneWeekAgo: Date = new Date(today.getTime() - 6 * oneDayMs);

  // 1週間前から今日までの日付を生成
  for (let i = 0; i < 7; i++) {
    const date: Date = new Date(oneWeekAgo.getTime() + i * oneDayMs);

    const month: string = (date.getMonth() + 1).toString();
    const day: string = date.getDate().toString();

    const dateString: string = `${month}月${day}日`;
    dates.push(dateString);
  }

  return dates;
}

const Chart = () => {
  const [data, setData] = React.useState([]);
  const theme = useTheme();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWeekComplete();
        const datesForPastWeek: string[] = getDatesForPastWeek();
        const newData = datesForPastWeek.reduce((res, ele) => {
          if (response[ele]) {
            res.push(createData(ele, response[ele] as number) as never);
          } else {
            res.push(createData(ele, 0) as never);
          }
          return res;
        }, []);
        setData(newData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    void fetchData();
  }, []);

  return (
    <React.Fragment>
      <Title>week&apos;s</Title>
      <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        <LineChart
          dataset={data}
          margin={{
            top: 16,
            right: 20,
            left: 70,
            bottom: 30,
          }}
          series={[
            {
              dataKey: 'amount',
              showMark: false,
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
              tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
            },
          ]}
          yAxis={[
            {
              label: '完了数',
              labelStyle: {
                ...(theme.typography.body1 as ChartsTextStyle),
                fill: theme.palette.text.primary,
              },
              tickLabelStyle: theme.typography.body2 as ChartsTextStyle,
              max: 30,
              tickNumber: 5,
            },
          ]}
        />
      </div>
    </React.Fragment>
  );
};

export default Chart;
