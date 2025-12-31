/**
 * Areas ページテスト
 *
 * エリア管理ページ（CRUD）
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AreasPage from '@/src/app/(admin)/areas/page';
import { Area } from '@/src/types';

// モック設定
const mockAreas: Area[] = [
  { id: 1, name: 'エリアA' },
  { id: 2, name: 'エリアB' },
  { id: 3, name: 'テストエリア' },
];

const mockCreateArea = jest.fn();
const mockUpdateArea = jest.fn();
const mockDeleteArea = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowErrorWithRetry = jest.fn();

jest.mock('@/src/infra/http', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

jest.mock('@/src/mutations', () => ({
  useAreaMutation: () => ({
    createArea: mockCreateArea,
    updateArea: mockUpdateArea,
    deleteArea: mockDeleteArea,
  }),
}));

jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: jest.fn(),
    showErrorWithRetry: mockShowErrorWithRetry,
    showToast: jest.fn(),
    removeToast: jest.fn(),
    toasts: [],
  }),
}));

// SWRをモック
const mockMutate = jest.fn();
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useSWR from 'swr';
import { httpClient } from '@/src/infra/http';

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('AreasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateArea.mockResolvedValue({ success: true, data: { id: 4, name: '新規エリア' } });
    mockUpdateArea.mockResolvedValue({ success: true, data: { id: 1, name: '更新エリア' } });
    mockDeleteArea.mockResolvedValue({ success: true, data: { message: '削除しました' } });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーを表示する', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('データ表示', () => {
    beforeEach(() => {
      mockUseSWR.mockReturnValue({
        data: mockAreas,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);
    });

    it('ページタイトルが表示される', () => {
      render(<AreasPage />);
      expect(screen.getByText('エリア管理')).toBeInTheDocument();
    });

    it('エリア数が表示される', () => {
      render(<AreasPage />);
      expect(screen.getByText('3件のエリアが登録されています')).toBeInTheDocument();
    });

    it('すべてのエリアが表示される', () => {
      render(<AreasPage />);
      expect(screen.getByText('エリアA')).toBeInTheDocument();
      expect(screen.getByText('エリアB')).toBeInTheDocument();
      expect(screen.getByText('テストエリア')).toBeInTheDocument();
    });

    it('「エリア追加」ボタンが表示される', () => {
      render(<AreasPage />);
      expect(screen.getByRole('button', { name: /エリア追加/ })).toBeInTheDocument();
    });
  });

  describe('検索機能', () => {
    beforeEach(() => {
      mockUseSWR.mockReturnValue({
        data: mockAreas,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);
    });

    it('検索バーが表示される', () => {
      render(<AreasPage />);
      expect(screen.getByPlaceholderText('エリア名で検索...')).toBeInTheDocument();
    });

    it('検索でエリアがフィルタリングされる', async () => {
      render(<AreasPage />);

      const searchInput = screen.getByPlaceholderText('エリア名で検索...');
      fireEvent.change(searchInput, { target: { value: 'テスト' } });

      await waitFor(() => {
        expect(screen.getByText('テストエリア')).toBeInTheDocument();
        expect(screen.queryByText('エリアA')).not.toBeInTheDocument();
        expect(screen.queryByText('エリアB')).not.toBeInTheDocument();
      });
    });

    it('検索結果件数が表示される', async () => {
      render(<AreasPage />);

      const searchInput = screen.getByPlaceholderText('エリア名で検索...');
      fireEvent.change(searchInput, { target: { value: 'テスト' } });

      await waitFor(() => {
        expect(screen.getByText('1件の結果')).toBeInTheDocument();
      });
    });
  });

  describe('空状態', () => {
    it('エリアがない場合は空メッセージを表示する', () => {
      mockUseSWR.mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.getByText('エリアがまだ登録されていません')).toBeInTheDocument();
    });

    it('検索結果がない場合は検索メッセージを表示する', async () => {
      mockUseSWR.mockReturnValue({
        data: mockAreas,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);

      const searchInput = screen.getByPlaceholderText('エリア名で検索...');
      fireEvent.change(searchInput, { target: { value: '存在しないエリア' } });

      await waitFor(() => {
        expect(screen.getByText('検索条件に一致するエリアが見つかりません')).toBeInTheDocument();
      });
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージを表示する', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('ネットワークエラーが発生しました'),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.getByText('エリアの読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByText('ネットワークエラーが発生しました')).toBeInTheDocument();
    });

    it('エラー時は再試行ボタンが表示される', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('エラー'),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    });

    it('再試行ボタンをクリックするとmutateが呼ばれる', async () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('エラー'),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      const retryButton = screen.getByRole('button', { name: '再試行' });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('エラー時はエリアカードを表示しない', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('エラー'),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.queryByText('エリアA')).not.toBeInTheDocument();
      expect(screen.queryByText('エリアがまだ登録されていません')).not.toBeInTheDocument();
    });

    it('エラーがError以外の場合は不明なエラーメッセージを表示する', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: 'string error',
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      render(<AreasPage />);
      expect(screen.getByText('不明なエラーが発生しました')).toBeInTheDocument();
    });
  });

  describe('ダイアログ操作', () => {
    beforeEach(() => {
      mockUseSWR.mockReturnValue({
        data: mockAreas,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);
    });

    it('「エリア追加」ボタンでダイアログが開く', async () => {
      render(<AreasPage />);

      const addButton = screen.getByRole('button', { name: /エリア追加/ });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('エリア追加', { selector: 'h2' })).toBeInTheDocument();
      });
    });
  });

  describe('CRUD操作', () => {
    beforeEach(() => {
      mockUseSWR.mockReturnValue({
        data: mockAreas,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);
    });

    describe('作成', () => {
      it('新規エリア作成が成功するとmutateが呼ばれる', async () => {
        mockCreateArea.mockResolvedValue({ success: true, data: { id: 4, name: '新規エリア' } });
        render(<AreasPage />);

        // ダイアログを開く
        const addButton = screen.getByRole('button', { name: /エリア追加/ });
        fireEvent.click(addButton);

        await waitFor(() => {
          expect(screen.getByText('エリア追加', { selector: 'h2' })).toBeInTheDocument();
        });

        // エリア名を入力して保存（ダイアログ内のテキストボックスを取得）
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '新規エリア' } });

        const saveButton = screen.getByRole('button', { name: '追加' });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockCreateArea).toHaveBeenCalledWith('新規エリア');
          expect(mockShowSuccess).toHaveBeenCalledWith('エリアを作成しました');
          expect(mockMutate).toHaveBeenCalled();
        });
      });

      it('作成失敗時にshowErrorWithRetryが呼ばれる', async () => {
        mockCreateArea.mockResolvedValue({ success: false, error: 'エリア名は既に使用されています' });
        render(<AreasPage />);

        const addButton = screen.getByRole('button', { name: /エリア追加/ });
        fireEvent.click(addButton);

        await waitFor(() => {
          expect(screen.getByText('エリア追加', { selector: 'h2' })).toBeInTheDocument();
        });

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '既存エリア' } });

        const saveButton = screen.getByRole('button', { name: '追加' });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockCreateArea).toHaveBeenCalledWith('既存エリア');
          expect(mockShowErrorWithRetry).toHaveBeenCalled();
          expect(mockMutate).not.toHaveBeenCalled();
        });
      });
    });

    describe('更新', () => {
      it('エリア更新が成功するとmutateが呼ばれる', async () => {
        mockUpdateArea.mockResolvedValue({ success: true, data: { id: 1, name: '更新エリア' } });
        render(<AreasPage />);

        // 編集ボタンをクリック
        const editButtons = screen.getAllByLabelText('編集');
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('エリア編集', { selector: 'h2' })).toBeInTheDocument();
        });

        // エリア名を更新して保存（ダイアログ内のテキストボックスを取得）
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '更新エリア' } });

        const saveButton = screen.getByRole('button', { name: '更新' });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockUpdateArea).toHaveBeenCalledWith(1, '更新エリア');
          expect(mockShowSuccess).toHaveBeenCalledWith('エリアを更新しました');
          expect(mockMutate).toHaveBeenCalled();
        });
      });
    });

    describe('削除', () => {
      it('エリア削除が成功するとmutateが呼ばれる', async () => {
        // confirmをモック
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
        mockDeleteArea.mockResolvedValue({ success: true });
        render(<AreasPage />);

        // 削除ボタンをクリック
        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(confirmSpy).toHaveBeenCalledWith('エリアAを削除しますか？');
          expect(mockDeleteArea).toHaveBeenCalledWith(1);
          expect(mockShowSuccess).toHaveBeenCalledWith('エリアを削除しました');
          expect(mockMutate).toHaveBeenCalled();
        });

        confirmSpy.mockRestore();
      });

      it('確認ダイアログでキャンセルすると削除されない', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
        render(<AreasPage />);

        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(confirmSpy).toHaveBeenCalled();
          expect(mockDeleteArea).not.toHaveBeenCalled();
        });

        confirmSpy.mockRestore();
      });

      it('削除失敗時にshowErrorWithRetryが呼ばれる', async () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
        mockDeleteArea.mockResolvedValue({ success: false, error: '削除できませんでした' });
        render(<AreasPage />);

        const deleteButtons = screen.getAllByRole('button', { name: '削除' });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockDeleteArea).toHaveBeenCalledWith(1);
          expect(mockShowErrorWithRetry).toHaveBeenCalled();
          expect(mockMutate).not.toHaveBeenCalled();
        });

        confirmSpy.mockRestore();
      });
    });
  });
});
