import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AreaListCheck from '@/src/components/AreaListCheck';
import { getAreas } from '@/src/api/get-areas';
import { logError } from '@/src/util/safe-logger';

// getAreas関数をモック化
jest.mock('@/src/api/get-areas');

// logErrorをモック化
jest.mock('@/src/util/safe-logger', () => ({
  logError: jest.fn(),
}));

// useToastをモック化
const mockShowError = jest.fn();
jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showError: mockShowError,
    showSuccess: jest.fn(),
  }),
}));

describe('AreaListCheck', () => {
  const mockAreas = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getAreas as jest.Mock).mockResolvedValue(mockAreas);
  });

  it('shows loading state initially', () => {
    // APIレスポンスを遅延させる
    (getAreas as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<AreaListCheck />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders area checkboxes after loading', async () => {
    render(<AreaListCheck />);

    await waitFor(() => {
      expect(screen.getByText('Area 1')).toBeInTheDocument();
      expect(screen.getByText('Area 2')).toBeInTheDocument();
      expect(screen.getByText('Area 3')).toBeInTheDocument();
    });

    // ローディングが消えていることを確認
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('toggles checkbox when clicked', async () => {
    render(<AreaListCheck />);

    await waitFor(() => {
      const checkbox = screen.getByLabelText('Area 1');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  it('shows error alert and calls showError on API error', async () => {
    (getAreas as jest.Mock).mockRejectedValue(new Error('API error'));

    render(<AreaListCheck />);

    await waitFor(() => {
      // エラーアラートが表示される
      expect(screen.getByText('エリア一覧の取得に失敗しました')).toBeInTheDocument();
      // 再試行ボタンが表示される
      expect(screen.getByRole('button', { name: /再試行/i })).toBeInTheDocument();
    });

    // logErrorが呼ばれる
    expect(logError).toHaveBeenCalledWith('[AreaListCheck]', expect.any(Error));
    // showErrorが呼ばれる
    expect(mockShowError).toHaveBeenCalledWith('エリア一覧の取得に失敗しました');
  });

  it('shows error alert on error response', async () => {
    (getAreas as jest.Mock).mockResolvedValue({
      errors: ['エリアが見つかりません'],
    });

    render(<AreaListCheck />);

    await waitFor(() => {
      expect(screen.getByText('エリア一覧の取得に失敗しました')).toBeInTheDocument();
    });

    expect(logError).toHaveBeenCalledWith('[AreaListCheck]', ['エリアが見つかりません']);
    expect(mockShowError).toHaveBeenCalledWith('エリア一覧の取得に失敗しました');
  });

  it('retries fetching when retry button is clicked', async () => {
    // 最初はエラー、2回目は成功
    (getAreas as jest.Mock)
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce(mockAreas);

    render(<AreaListCheck />);

    // エラー状態を待つ
    await waitFor(() => {
      expect(screen.getByText('エリア一覧の取得に失敗しました')).toBeInTheDocument();
    });

    // 再試行ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: /再試行/i }));

    // エリアが表示される
    await waitFor(() => {
      expect(screen.getByText('Area 1')).toBeInTheDocument();
      expect(screen.getByText('Area 2')).toBeInTheDocument();
      expect(screen.getByText('Area 3')).toBeInTheDocument();
    });

    // getAreasが2回呼ばれている
    expect(getAreas).toHaveBeenCalledTimes(2);
  });
});
