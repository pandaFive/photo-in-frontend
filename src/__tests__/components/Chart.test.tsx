import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chart from '@/src/components/Chart';

// Server Actionをモック
jest.mock('@/src/api/get-week-complete', () => ({
  getWeekComplete: jest.fn(),
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

import { getWeekComplete } from '@/src/api/get-week-complete';

const mockGetWeekComplete = getWeekComplete as jest.MockedFunction<
  typeof getWeekComplete
>;

describe('Chart', () => {
  beforeEach(() => {
    mockGetWeekComplete.mockClear();
  });

  test('renders Chart component with title', async () => {
    mockGetWeekComplete.mockResolvedValueOnce({});

    render(<Chart />);

    await waitFor(() => {
      expect(mockGetWeekComplete).toHaveBeenCalled();
    });

    // タイトルが表示されることを確認
    expect(screen.getByText("week's")).toBeInTheDocument();
  });

  test('fetches and displays chart data on mount', async () => {
    const mockData = {
      '12月1日': 5,
      '12月2日': 10,
      '12月3日': 8,
    };
    mockGetWeekComplete.mockResolvedValueOnce(mockData);

    render(<Chart />);

    await waitFor(() => {
      expect(mockGetWeekComplete).toHaveBeenCalledTimes(1);
    });

    // LineChartがレンダリングされることを確認
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('handles empty chart data', async () => {
    mockGetWeekComplete.mockResolvedValueOnce({});

    render(<Chart />);

    await waitFor(() => {
      expect(mockGetWeekComplete).toHaveBeenCalled();
    });

    // 空のデータでもコンポーネントがクラッシュしないことを確認
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockGetWeekComplete.mockRejectedValueOnce(new Error('Fetch failed'));

    render(<Chart />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('renders LineChart component', async () => {
    mockGetWeekComplete.mockResolvedValueOnce({
      '12月1日': 5,
    });

    render(<Chart />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});
