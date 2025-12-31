/**
 * AreaDialog テスト
 *
 * エリア作成・編集ダイアログ
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AreaDialog from '@/src/components/AreaDialog';
import { Area } from '@/src/types';

/**
 * MUI TextFieldの入力要素を取得するヘルパー
 */
const getInput = (): HTMLInputElement => {
  return document.querySelector('input[type="text"]') as HTMLInputElement;
};

describe('AreaDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    editingArea: null as Area | null,
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe('新規作成モード', () => {
    it('「エリア追加」タイトルが表示される', () => {
      render(<AreaDialog {...defaultProps} />);
      expect(screen.getByText('エリア追加')).toBeInTheDocument();
    });

    it('エリア名入力フィールドが空で表示される', () => {
      render(<AreaDialog {...defaultProps} />);
      const input = getInput();
      expect(input).toHaveValue('');
    });

    it('保存ボタンのテキストが「追加」になる', () => {
      render(<AreaDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
    });
  });

  describe('編集モード', () => {
    const editingArea: Area = { id: 1, name: '既存エリア' };

    it('「エリア編集」タイトルが表示される', () => {
      render(<AreaDialog {...defaultProps} editingArea={editingArea} />);
      expect(screen.getByText('エリア編集')).toBeInTheDocument();
    });

    it('エリア名入力フィールドに既存の名前が表示される', () => {
      render(<AreaDialog {...defaultProps} editingArea={editingArea} />);
      const input = getInput();
      expect(input).toHaveValue('既存エリア');
    });

    it('保存ボタンのテキストが「更新」になる', () => {
      render(<AreaDialog {...defaultProps} editingArea={editingArea} />);
      expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
    });
  });

  describe('バリデーション', () => {
    it('空のエリア名でエラーメッセージが表示される', async () => {
      render(<AreaDialog {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('エリア名は必須です')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('32文字を超えるエリア名でエラーメッセージが表示される', async () => {
      render(<AreaDialog {...defaultProps} />);

      const input = getInput();
      fireEvent.change(input, { target: { value: 'あ'.repeat(33) } });

      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('エリア名は32文字以内で入力してください')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('有効なエリア名でonSaveが呼ばれる', async () => {
      render(<AreaDialog {...defaultProps} />);

      const input = getInput();
      fireEvent.change(input, { target: { value: 'テストエリア' } });

      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('テストエリア');
      });
    });

    it('空白のみのエリア名でエラーメッセージが表示される', async () => {
      render(<AreaDialog {...defaultProps} />);

      const input = getInput();
      fireEvent.change(input, { target: { value: '   ' } });

      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('エリア名は必須です')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('送信中の状態', () => {
    it('送信中はボタンが無効化される', () => {
      render(<AreaDialog {...defaultProps} isSubmitting={true} />);

      const addButton = screen.getByRole('button', { name: '追加中...' });
      expect(addButton).toBeDisabled();
    });

    it('送信中は入力フィールドが無効化される', () => {
      render(<AreaDialog {...defaultProps} isSubmitting={true} />);

      const input = getInput();
      expect(input).toBeDisabled();
    });
  });

  describe('キャンセル操作', () => {
    it('キャンセルボタンでonCloseが呼ばれる', () => {
      render(<AreaDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('送信中はキャンセルボタンも無効化される', () => {
      render(<AreaDialog {...defaultProps} isSubmitting={true} />);

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('ダイアログが閉じているとき', () => {
    it('ダイアログが表示されない', () => {
      render(<AreaDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('エリア追加')).not.toBeInTheDocument();
    });
  });

  describe('入力値のトリム', () => {
    it('前後の空白をトリムしてonSaveを呼ぶ', async () => {
      render(<AreaDialog {...defaultProps} />);

      const input = getInput();
      fireEvent.change(input, { target: { value: '  テストエリア  ' } });

      const addButton = screen.getByRole('button', { name: '追加' });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('テストエリア');
      });
    });
  });
});
