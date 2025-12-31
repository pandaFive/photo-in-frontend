/**
 * AreaCard テスト
 *
 * エリアカードコンポーネント
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import AreaCard from '@/src/components/AreaCard';
import { Area } from '@/src/types';

describe('AreaCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockArea: Area = { id: 1, name: 'テストエリア' };

  const defaultProps = {
    area: mockArea,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('表示', () => {
    it('エリア名が表示される', () => {
      render(<AreaCard {...defaultProps} />);
      expect(screen.getByText('テストエリア')).toBeInTheDocument();
    });

    it('編集ボタンが表示される', () => {
      render(<AreaCard {...defaultProps} />);
      expect(screen.getByLabelText('編集')).toBeInTheDocument();
    });

    it('削除ボタンが表示される', () => {
      render(<AreaCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });
  });

  describe('編集操作', () => {
    it('編集ボタンをクリックするとonEditが呼ばれる', () => {
      render(<AreaCard {...defaultProps} />);

      const editButton = screen.getByLabelText('編集');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockArea);
    });
  });

  describe('削除操作', () => {
    it('削除ボタンをクリックすると確認ダイアログが表示される', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      render(<AreaCard {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      fireEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith('テストエリアを削除しますか？');
      confirmSpy.mockRestore();
    });

    it('確認ダイアログでキャンセルするとonDeleteが呼ばれない', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      render(<AreaCard {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('確認ダイアログでOKするとonDeleteが呼ばれる', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<AreaCard {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(1);
      confirmSpy.mockRestore();
    });
  });

  describe('スタイル', () => {
    it('カードがレンダリングされる', () => {
      render(<AreaCard {...defaultProps} />);
      // MUI Cardは role="article" ではなく div としてレンダリングされる
      expect(screen.getByText('テストエリア').closest('.MuiCard-root')).toBeInTheDocument();
    });
  });

  describe('様々なエリア名', () => {
    it('長いエリア名も表示される', () => {
      const longNameArea: Area = { id: 2, name: 'とても長いエリア名のテスト' };
      render(<AreaCard {...defaultProps} area={longNameArea} />);
      expect(screen.getByText('とても長いエリア名のテスト')).toBeInTheDocument();
    });

    it('短いエリア名も表示される', () => {
      const shortNameArea: Area = { id: 3, name: 'A' };
      render(<AreaCard {...defaultProps} area={shortNameArea} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('削除中状態', () => {
    it('isDeleting=trueの時、削除ボタンが無効化される', () => {
      render(<AreaCard {...defaultProps} isDeleting={true} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      expect(deleteButton).toBeDisabled();
    });

    it('isDeleting=trueの時、削除ボタンクリックでconfirmが呼ばれない', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(<AreaCard {...defaultProps} isDeleting={true} />);

      const deleteButton = screen.getByRole('button', { name: '削除' });
      fireEvent.click(deleteButton);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('isDeleting=trueの時、ローディングインジケーターが表示される', () => {
      render(<AreaCard {...defaultProps} isDeleting={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
