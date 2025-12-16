import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chart from '@/src/components/Chart';

// useWeekComplete hookをモック
const mockUseWeekComplete = jest.fn();
jest.mock('@/src/queries', () => ({
  useWeekComplete: () => mockUseWeekComplete(),
}));

// MUI ThemeProviderをモック
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      primary: { light: '#42a5f5' },
      text: { secondary: '#757575', primary: '#212121' },
    },
    typography: {
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.875rem' },
    },
  }),
}));

// MUI X ChartsのLineChartをモック
jest.mock('@mui/x-charts', () => ({
  LineChart: ({ dataset }: { dataset: unknown[] }) => (
    <div data-testid="line-chart">
      LineChart Mock - {dataset?.length ?? 0} data points
    </div>
  ),
  axisClasses: {
    root: 'MuiChartsAxis-root',
    left: 'MuiChartsAxis-left',
    label: 'MuiChartsAxis-label',
  },
}));

jest.mock('@mui/x-charts/ChartsText', () => ({
  ChartsTextStyle: {},
}));

describe('Chart', () => {
  beforeEach(() => {
    mockUseWeekComplete.mockClear();
  });

  test('renders Chart component with title', () => {
    mockUseWeekComplete.mockReturnValue({
      data: [],
      max: 10,
      isLoading: false,
      error: null,
    });

    render(<Chart />);

    // タイトルが表示されることを確認
    expect(screen.getByText("week's")).toBeInTheDocument();
  });

  test('renders chart with data points', () => {
    const mockData = [
      { date: '12月1日', amount: 5 },
      { date: '12月2日', amount: 10 },
      { date: '12月3日', amount: 8 },
    ];
    mockUseWeekComplete.mockReturnValue({
      data: mockData,
      max: 15,
      isLoading: false,
      error: null,
    });

    render(<Chart />);

    // LineChartがレンダリングされることを確認
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('LineChart Mock - 3 data points')).toBeInTheDocument();
  });

  test('handles empty chart data', () => {
    mockUseWeekComplete.mockReturnValue({
      data: [],
      max: 10,
      isLoading: false,
      error: null,
    });

    render(<Chart />);

    // 空のデータでもコンポーネントがクラッシュしないことを確認
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('LineChart Mock - 0 data points')).toBeInTheDocument();
  });

  test('displays error message when fetch fails', () => {
    mockUseWeekComplete.mockReturnValue({
      data: [],
      max: 10,
      isLoading: false,
      error: 'データの取得に失敗しました',
    });

    render(<Chart />);

    // エラーメッセージが表示されることを確認
    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
  });

  test('renders LineChart component when loading completes', () => {
    mockUseWeekComplete.mockReturnValue({
      data: [{ date: '12月1日', amount: 5 }],
      max: 10,
      isLoading: false,
      error: null,
    });

    render(<Chart />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    mockUseWeekComplete.mockReturnValue({
      data: [],
      max: 10,
      isLoading: true,
      error: null,
    });

    render(<Chart />);

    // ローディング中もコンポーネントがレンダリングされる
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
