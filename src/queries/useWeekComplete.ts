import useSWR from 'swr';

import { getWeekComplete } from '@/src/api/get-week-complete';
import { getDatesForPastWeek } from '@/src/domain/functions/date';
import { getNow } from '@/src/infra/time';
import { WeekCompleteData } from '@/src/types';

const Y_AXIS_PADDING = 5;
const DEFAULT_MAX_VALUE = 10;

type ChartData = {
  date: string;
  amount: number | null;
};

type UseWeekCompleteReturn = {
  data: ChartData[];
  max: number;
  isLoading: boolean;
  error: string | null;
};

/**
 * WeekCompleteDataをチャート用データに変換
 */
const transformToChartData = (
  response: WeekCompleteData,
  dates: string[],
): ChartData[] => {
  return dates.map((dateString) => ({
    date: dateString,
    amount: response[dateString] ?? 0,
  }));
};

/**
 * チャートデータからY軸の最大値を計算
 */
const calculateMax = (data: ChartData[]): number => {
  const maxAmount = Math.max(...data.map((d) => d.amount ?? 0));
  return maxAmount > 0 ? maxAmount + Y_AXIS_PADDING : DEFAULT_MAX_VALUE;
};

/**
 * 週間完了データを取得するSWR Query Hook
 */
export const useWeekComplete = (): UseWeekCompleteReturn => {
  const { data: rawData, error, isLoading } = useSWR<WeekCompleteData, Error>(
    '/api/week-complete',
    async () => {
      const result = await getWeekComplete();
      // Server Actionからの戻り値をそのまま返す
      return result as WeekCompleteData;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5分（Server Actionのrevalidate: 300と同期）
    },
  );

  // データ変換（純粋関数）
  const dates = getDatesForPastWeek(getNow());
  const chartData = rawData ? transformToChartData(rawData, dates) : [];
  const max = chartData.length > 0 ? calculateMax(chartData) : DEFAULT_MAX_VALUE;

  return {
    data: chartData,
    max,
    isLoading,
    error: error ? 'データの取得に失敗しました' : null,
  };
};
