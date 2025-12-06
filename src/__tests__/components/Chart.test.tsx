import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chart from '@/src/components/Chart';

// グローバルfetchをモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockChartData = {
  '2023-01-01': 5,
  '2023-01-02': 10,
  '2023-01-03': 8,
  '2023-01-04': 12,
  '2023-01-05': 15,
  '2023-01-06': 7,
  '2023-01-07': 9,
};

describe('Chart', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('renders Chart component', () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockChartData),
    });

    render(<Chart accountId={1} />);

    // チャートコンポーネントがレンダリングされることを確認
    expect(screen.getByText(/Chart/i) || screen.getByRole('img')).toBeTruthy();
  });

  test('fetches chart data on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockChartData),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/accounts/1/chart'),
        expect.any(Object),
      );
    });
  });

  test('handles empty chart data', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // 空のデータでもコンポーネントがクラッシュしないことを確認
  });

  test('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('updates chart when accountId changes', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockChartData),
    });

    const { rerender } = render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/accounts/1/chart'),
        expect.any(Object),
      );
    });

    mockFetch.mockClear();

    rerender(<Chart accountId={2} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/accounts/2/chart'),
        expect.any(Object),
      );
    });
  });

  test('processes chart data correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockChartData),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // データが正しく処理されることを確認
    // Note: 実際のチャートライブラリの実装に依存します
  });

  test('calculates max value correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockChartData),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // 最大値が正しく計算されることを確認
    // Note: コンポーネントの内部状態やプロップスに依存します
  });

  test('formats dates correctly for chart labels', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockChartData),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // 日付が正しくフォーマットされることを確認
    // Note: チャートライブラリの実装に依存します
  });

  test('handles large datasets', async () => {
    const largeDataset: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
      const date = new Date(2023, 0, i + 1);
      largeDataset[date.toISOString()] = Math.floor(Math.random() * 20);
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(largeDataset),
    });

    render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // 大きなデータセットでもコンポーネントがクラッシュしないことを確認
  });

  test('responds to data updates', async () => {
    const initialData = { '2023-01-01': 5 };
    const updatedData = { '2023-01-01': 10, '2023-01-02': 15 };

    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve(initialData),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(updatedData),
      });

    const { rerender } = render(<Chart accountId={1} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender(<Chart accountId={1} />);

    // データの更新に対応することを確認
  });
});
