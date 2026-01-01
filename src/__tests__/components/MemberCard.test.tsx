/**
 * MemberCard テスト
 *
 * メンバーカードコンポーネント（編集ボタン追加対応）
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MemberCard from '@/src/components/MemberCard';
import { MemberStatus } from '@/src/types';

// モック設定
const mockDeleteAccount = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowErrorWithRetry = jest.fn();

jest.mock('@/src/mutations', () => ({
  useAccountMutation: () => ({
    deleteAccount: mockDeleteAccount,
    updateAccount: jest.fn(),
  }),
}));

jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: jest.fn(),
    showErrorWithRetry: mockShowErrorWithRetry,
  }),
}));

describe('MemberCard', () => {
  const mockMember: MemberStatus = {
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
  };

  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  const defaultProps = {
    member: mockMember,
    onDelete: mockOnDelete,
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteAccount.mockResolvedValue({ success: true });
  });

  describe('基本表示', () => {
    it('メンバー名が表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
    });

    it('エリアが表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('エリアA')).toBeInTheDocument();
      expect(screen.getByText('エリアB')).toBeInTheDocument();
    });

    it('キャパシティが表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('編集ボタン', () => {
    it('編集ボタンが表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByLabelText('編集')).toBeInTheDocument();
    });

    it('編集ボタンをクリックするとonEditが呼ばれる', () => {
      render(<MemberCard {...defaultProps} />);

      const editButton = screen.getByLabelText('編集');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockMember);
    });
  });

  describe('削除ボタン', () => {
    it('削除ボタンが表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByLabelText('メンバーを削除')).toBeInTheDocument();
    });

    it('削除ボタンをクリックして確認するとdeleteAccountが呼ばれる', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<MemberCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('メンバーを削除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('山田太郎を削除しますか？');
        expect(mockDeleteAccount).toHaveBeenCalledWith(1);
      });

      confirmSpy.mockRestore();
    });

    it('削除成功時にonDeleteが呼ばれる', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockDeleteAccount.mockResolvedValue({ success: true });
      render(<MemberCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('メンバーを削除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(1);
        expect(mockShowSuccess).toHaveBeenCalledWith('メンバーを削除しました');
      });

      confirmSpy.mockRestore();
    });

    it('削除キャンセル時はdeleteAccountが呼ばれない', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      render(<MemberCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('メンバーを削除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(mockDeleteAccount).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('削除失敗時にshowErrorWithRetryが呼ばれる', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      mockDeleteAccount.mockResolvedValue({ success: false, error: '削除に失敗しました' });
      render(<MemberCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('メンバーを削除');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockShowErrorWithRetry).toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });

    it('削除中は削除ボタンが無効化されダブルクリックを防ぐ', async () => {
      let resolveDelete: (value: { success: boolean }) => void;
      const deletePromise = new Promise<{ success: boolean }>((resolve) => {
        resolveDelete = resolve;
      });
      mockDeleteAccount.mockReturnValue(deletePromise);

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<MemberCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText('メンバーを削除');

      // 1回目のクリック
      fireEvent.click(deleteButton);

      // 削除中はボタンが無効化される
      await waitFor(() => {
        expect(deleteButton).toBeDisabled();
      });

      // 2回目のクリックは無視される
      fireEvent.click(deleteButton);
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1);

      // 削除完了
      resolveDelete!({ success: true });

      await waitFor(() => {
        expect(deleteButton).not.toBeDisabled();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('NG率表示', () => {
    it('NG率が正しく表示される', () => {
      render(<MemberCard {...defaultProps} />);
      expect(screen.getByText('10.0%')).toBeInTheDocument();
    });
  });
});
