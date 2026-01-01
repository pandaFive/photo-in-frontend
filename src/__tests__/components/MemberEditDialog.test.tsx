/**
 * MemberEditDialog テスト
 *
 * メンバー編集ダイアログ
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MemberEditDialog from '@/src/components/MemberEditDialog';
import { Area, MemberStatus } from '@/src/types';

// モック設定
const mockAreas: Area[] = [
  { id: 1, name: 'エリアA' },
  { id: 2, name: 'エリアB' },
  { id: 3, name: 'エリアC' },
];

const mockShowWarning = jest.fn();

jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: mockShowWarning,
    showErrorWithRetry: jest.fn(),
  }),
}));

jest.mock('@/src/util/safe-logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

/**
 * MUI TextFieldの入力要素を取得するヘルパー
 */
const getNameInput = (): HTMLInputElement => {
  return screen.getByRole('textbox', { name: /名前/ }) as HTMLInputElement;
};

const getCapacityInput = (): HTMLInputElement => {
  return screen.getByRole('spinbutton', { name: /1日の最大撮影数/ }) as HTMLInputElement;
};

describe('MemberEditDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

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

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    editingMember: mockMember,
    isSubmitting: false,
    areas: mockAreas,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
    mockShowWarning.mockClear();
  });

  describe('初期表示', () => {
    it('「メンバー編集」タイトルが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('メンバー編集')).toBeInTheDocument();
      });
    });

    it('名前入力フィールドにメンバー名が表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        const input = getNameInput();
        expect(input).toHaveValue('山田太郎');
      });
    });

    it('キャパシティ入力フィールドに値が表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        const input = getCapacityInput();
        expect(input).toHaveValue(5);
      });
    });

    it('保存ボタンのテキストが「更新」になる', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
      });
    });

    it('エリアチェックボックスが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByLabelText('エリアA')).toBeInTheDocument();
        expect(screen.getByLabelText('エリアB')).toBeInTheDocument();
        expect(screen.getByLabelText('エリアC')).toBeInTheDocument();
      });
    });

    it('既存のエリアがチェックされている', async () => {
      render(<MemberEditDialog {...defaultProps} />);
      await waitFor(() => {
        const areaACheckbox = screen.getByLabelText('エリアA');
        const areaBCheckbox = screen.getByLabelText('エリアB');
        const areaCCheckbox = screen.getByLabelText('エリアC');
        expect(areaACheckbox).toBeChecked();
        expect(areaBCheckbox).toBeChecked();
        expect(areaCCheckbox).not.toBeChecked();
      });
    });
  });

  describe('バリデーション', () => {
    it('空の名前でエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getNameInput();
        fireEvent.change(input, { target: { value: '' } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('名前は必須です')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('32文字を超える名前でエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getNameInput();
        fireEvent.change(input, { target: { value: 'あ'.repeat(33) } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('名前は32文字以内で入力してください')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('負のキャパシティでエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getCapacityInput();
        fireEvent.change(input, { target: { value: '-1' } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('1日の最大撮影数は0以上1000以下の整数で入力してください')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('キャパシティが上限を超えるとエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getCapacityInput();
        fireEvent.change(input, { target: { value: '1001' } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('1日の最大撮影数は0以上1000以下の整数で入力してください')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('小数のキャパシティ入力で即座にエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getCapacityInput();
        fireEvent.change(input, { target: { value: '1.5' } });
      });

      await waitFor(() => {
        expect(screen.getByText('1日の最大撮影数は0以上1000以下の整数で入力してください')).toBeInTheDocument();
      });
    });

    it('有効な入力でonSaveが呼ばれる', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getNameInput();
        expect(input).toHaveValue('山田太郎');
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('山田太郎', [1, 2], 5);
      });
    });
  });

  describe('エリア選択の変更', () => {
    it('エリアのチェックを外すと選択から除外される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const areaACheckbox = screen.getByLabelText('エリアA');
        fireEvent.click(areaACheckbox);
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('山田太郎', [2], 5);
      });
    });

    it('新しいエリアをチェックすると選択に追加される', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const areaCCheckbox = screen.getByLabelText('エリアC');
        fireEvent.click(areaCCheckbox);
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('山田太郎', [1, 2, 3], 5);
      });
    });

    it('すべてのエリアを外しても更新できる', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const areaACheckbox = screen.getByLabelText('エリアA');
        const areaBCheckbox = screen.getByLabelText('エリアB');
        fireEvent.click(areaACheckbox);
        fireEvent.click(areaBCheckbox);
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('山田太郎', [], 5);
      });
    });
  });

  describe('送信中の状態', () => {
    it('送信中はボタンが無効化される', async () => {
      render(<MemberEditDialog {...defaultProps} isSubmitting={true} />);

      await waitFor(() => {
        const updateButton = screen.getByRole('button', { name: '更新中...' });
        expect(updateButton).toBeDisabled();
      });
    });

    it('送信中は入力フィールドが無効化される', async () => {
      render(<MemberEditDialog {...defaultProps} isSubmitting={true} />);

      await waitFor(() => {
        const nameInput = getNameInput();
        const capacityInput = getCapacityInput();
        expect(nameInput).toBeDisabled();
        expect(capacityInput).toBeDisabled();
      });
    });
  });

  describe('キャンセル操作', () => {
    it('キャンセルボタンでonCloseが呼ばれる', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        fireEvent.click(cancelButton);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('送信中はキャンセルボタンも無効化される', async () => {
      render(<MemberEditDialog {...defaultProps} isSubmitting={true} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  describe('ダイアログが閉じているとき', () => {
    it('ダイアログが表示されない', () => {
      render(<MemberEditDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('メンバー編集')).not.toBeInTheDocument();
    });
  });

  describe('入力値のトリム', () => {
    it('名前の前後の空白をトリムしてonSaveを呼ぶ', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getNameInput();
        fireEvent.change(input, { target: { value: '  テスト太郎  ' } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('テスト太郎', [1, 2], 5);
      });
    });
  });

  describe('キャパシティ0の場合', () => {
    it('キャパシティ0で更新できる', async () => {
      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        const input = getCapacityInput();
        fireEvent.change(input, { target: { value: '0' } });
      });

      const updateButton = screen.getByRole('button', { name: '更新' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('山田太郎', [1, 2], 0);
      });
    });
  });

  describe('エリア情報が空の場合', () => {
    it('エリアが空配列の場合はエラーメッセージが表示される', async () => {
      render(<MemberEditDialog {...defaultProps} areas={[]} />);

      await waitFor(() => {
        expect(
          screen.getByText('エリア情報を読み込めませんでした。ダイアログを閉じて再試行してください。'),
        ).toBeInTheDocument();
      });

      // チェックボックスが表示されないことを確認
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('エリアマッピング', () => {
    it('存在しないエリア名がある場合はlogErrorとshowWarningが呼ばれる', async () => {
      const { logError } = jest.requireMock('@/src/util/safe-logger');
      const memberWithUnknownArea: MemberStatus = {
        ...mockMember,
        area: ['エリアA', '未知のエリア', '存在しないエリア'],
      };

      render(<MemberEditDialog {...defaultProps} editingMember={memberWithUnknownArea} />);

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(
          '[MemberEditDialog] エリア名のマッピングに失敗',
          expect.objectContaining({
            memberId: memberWithUnknownArea.id,
            memberName: memberWithUnknownArea.name,
            unmappedAreas: ['未知のエリア', '存在しないエリア'],
          }),
        );
        expect(mockShowWarning).toHaveBeenCalledWith(
          '次のエリアは選択リストにありません: 未知のエリア, 存在しないエリア',
        );
      });
    });

    it('すべてのエリアがマッピングできる場合はlogErrorもshowWarningも呼ばれない', async () => {
      const { logError } = jest.requireMock('@/src/util/safe-logger');

      render(<MemberEditDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText('エリアA')).toBeInTheDocument();
      });

      expect(logError).not.toHaveBeenCalledWith(
        '[MemberEditDialog] エリア名のマッピングに失敗',
        expect.anything(),
      );
      expect(mockShowWarning).not.toHaveBeenCalled();
    });
  });

  describe('送信中のチェックボックス状態', () => {
    it('送信中はエリアチェックボックスも無効化される', async () => {
      render(<MemberEditDialog {...defaultProps} isSubmitting={true} />);

      await waitFor(() => {
        const areaACheckbox = screen.getByLabelText('エリアA');
        expect(areaACheckbox).toBeDisabled();
      });
    });
  });

  describe('areasの再検証時のフォームリセット防止', () => {
    it('areasが変更されても編集中の入力値がリセットされない', async () => {
      const { rerender } = render(<MemberEditDialog {...defaultProps} />);

      // 初期値を確認
      await waitFor(() => {
        expect(getNameInput()).toHaveValue('山田太郎');
        expect(getCapacityInput()).toHaveValue(5);
      });

      // ユーザーが入力値を変更
      fireEvent.change(getNameInput(), { target: { value: '変更後の名前' } });
      fireEvent.change(getCapacityInput(), { target: { value: '10' } });

      expect(getNameInput()).toHaveValue('変更後の名前');
      expect(getCapacityInput()).toHaveValue(10);

      // SWRの再検証でareasの参照が変わる（同じ内容の新しい配列）
      const newAreas: Area[] = [
        { id: 1, name: 'エリアA' },
        { id: 2, name: 'エリアB' },
        { id: 3, name: 'エリアC' },
      ];
      rerender(<MemberEditDialog {...defaultProps} areas={newAreas} />);

      // 編集中の入力値がリセットされていないことを確認
      expect(getNameInput()).toHaveValue('変更後の名前');
      expect(getCapacityInput()).toHaveValue(10);
    });

    it('ダイアログを閉じて再度開くと新しいメンバーで初期化される', async () => {
      const { rerender } = render(<MemberEditDialog {...defaultProps} />);

      // 初期値を確認
      await waitFor(() => {
        expect(getNameInput()).toHaveValue('山田太郎');
      });

      // 入力値を変更
      fireEvent.change(getNameInput(), { target: { value: '変更後の名前' } });

      // ダイアログを閉じる
      rerender(<MemberEditDialog {...defaultProps} open={false} />);

      // 別のメンバーで再度開く
      const anotherMember: MemberStatus = {
        id: 2,
        name: '佐藤花子',
        capacity: 3,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        area: ['エリアC'],
        total: 30,
        week: 3,
        ng_rate: 0.05,
        assign: 2,
      };
      rerender(<MemberEditDialog {...defaultProps} open={true} editingMember={anotherMember} />);

      // 新しいメンバーのデータで初期化されることを確認
      await waitFor(() => {
        expect(getNameInput()).toHaveValue('佐藤花子');
        expect(getCapacityInput()).toHaveValue(3);
      });
    });
  });
});
