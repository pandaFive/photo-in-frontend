/**
 * Members ページテスト
 *
 * メンバー管理ページ（編集機能追加対応）
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import { Area, MemberStatus } from '@/src/types';

// モック設定
const mockMutate = jest.fn();
const mockUpdateAccount = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowErrorWithRetry = jest.fn();

// テストデータ
const mockMembers: MemberStatus[] = [
  {
    id: 1,
    name: '山田太郎',
    capacity: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    area: ['エリアA', 'エリアB'],
    total: 50,
    week: 5,
    ng_rate: 0.1,
    assign: 3,
  },
  {
    id: 2,
    name: '佐藤花子',
    capacity: 3,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    area: ['エリアC'],
    total: 30,
    week: 3,
    ng_rate: 0.05,
    assign: 2,
  },
];

const mockAreas: Area[] = [
  { id: 1, name: 'エリアA' },
  { id: 2, name: 'エリアB' },
  { id: 3, name: 'エリアC' },
];

// SWRモック用のレスポンス設定
let membersResponse: {
  data?: MemberStatus[];
  error?: Error;
  isLoading: boolean;
  mutate: jest.Mock;
};
let areasResponse: {
  data?: Area[];
  error?: Error;
  isLoading: boolean;
  mutate: jest.Mock;
};

// SWRモック
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key: string) => {
    if (key === 'members') {
      return membersResponse;
    }
    if (key === 'areas') {
      return areasResponse;
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    };
  }),
}));

// MUI コンポーネントのモック
jest.mock('@mui/material', () => {
  const actualMui = jest.requireActual('@mui/material');
  return {
    ...actualMui,
    CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>,
  };
});

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('@/src/mutations', () => ({
  useAccountMutation: () => ({
    updateAccount: mockUpdateAccount,
    deleteAccount: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showErrorWithRetry: mockShowErrorWithRetry,
  }),
}));

jest.mock('@/src/infra/http', () => ({
  httpClient: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// テスト対象のページをインポート（モック設定後）
import Members from '@/src/app/(admin)/members/page';

describe('Members Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateAccount.mockResolvedValue({ success: true, data: mockMembers[0] });

    // デフォルトのレスポンス設定
    membersResponse = {
      data: mockMembers,
      error: undefined,
      isLoading: false,
      mutate: mockMutate,
    };
    areasResponse = {
      data: mockAreas,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    };
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーが表示される', () => {
      membersResponse = {
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: mockMutate,
      };

      render(<Members />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('メンバー一覧表示', () => {
    it('メンバーが正しく表示される', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      });
    });

    it('ページタイトルとメンバー数が表示される', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('撮影者管理')).toBeInTheDocument();
        expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
      });
    });
  });

  describe('編集機能', () => {
    it('編集ボタンをクリックするとダイアログが開く', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      // 編集ボタンをクリック
      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      // ダイアログが開く
      await waitFor(() => {
        expect(screen.getByText('メンバー編集')).toBeInTheDocument();
      });
    });

    it('ダイアログにメンバー情報が表示される', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        const nameInput = screen.getByRole('textbox', { name: /名前/ });
        expect(nameInput).toHaveValue('山田太郎');
      });
    });

    it('更新成功時にトーストが表示されダイアログが閉じる', async () => {
      mockUpdateAccount.mockResolvedValue({ success: true, data: mockMembers[0] });

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('メンバー編集')).toBeInTheDocument();
      });

      // 更新ボタンをクリック
      const updateButton = screen.getByRole('button', { name: '更新' });
      await act(async () => {
        fireEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(mockUpdateAccount).toHaveBeenCalledWith(1, '山田太郎', [1, 2], 5);
        expect(mockShowSuccess).toHaveBeenCalledWith('メンバーを更新しました');
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('更新失敗時にエラートーストが表示される', async () => {
      mockUpdateAccount.mockResolvedValue({
        success: false,
        error: '更新に失敗しました',
      });

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('メンバー編集')).toBeInTheDocument();
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      await act(async () => {
        fireEvent.click(updateButton);
      });

      await waitFor(() => {
        expect(mockShowErrorWithRetry).toHaveBeenCalled();
      });
    });

    it('キャンセルボタンでダイアログが閉じる', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('メンバー編集')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('メンバー編集')).not.toBeInTheDocument();
      });
    });
  });

  describe('検索機能', () => {
    it('名前で検索できる', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('名前またはエリアで検索...');
      fireEvent.change(searchInput, { target: { value: '山田' } });

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
      });
    });
  });

  describe('エリア読み込みエラー時', () => {
    it('エリア読み込みエラーでもメンバー一覧は表示される', async () => {
      areasResponse = {
        data: undefined,
        error: new Error('エリアの読み込みに失敗'),
        isLoading: false,
        mutate: jest.fn(),
      };

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      });
    });

    it('エリア読み込みエラー時に編集ボタンをクリックするとエラートーストが表示される', async () => {
      areasResponse = {
        data: undefined,
        error: new Error('エリアの読み込みに失敗'),
        isLoading: false,
        mutate: jest.fn(),
      };

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText('編集');
      fireEvent.click(editButtons[0]);

      expect(mockShowError).toHaveBeenCalledWith('エリア情報の読み込みに失敗したため、編集できません');
      expect(screen.queryByText('メンバー編集')).not.toBeInTheDocument();
    });
  });

  describe('メンバー読み込みエラー時', () => {
    it('エラーメッセージが表示される', async () => {
      membersResponse = {
        data: undefined,
        error: new Error('メンバーの読み込みに失敗しました'),
        isLoading: false,
        mutate: mockMutate,
      };

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('撮影者の読み込みに失敗しました')).toBeInTheDocument();
      });
    });
  });
});
