/**
 * Members Component - 基本テスト
 *
 * メンバー管理ページの基本的な表示・削除機能テスト
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Area, MemberStatus } from '@/src/types';

// テストデータ
const mockMemberStatus: MemberStatus[] = [
  {
    id: 1,
    name: 'Member 1',
    capacity: 2,
    createdAt: '2024-07-01',
    area: [],
    total: 3,
    week: 2,
    ng_rate: 0.2,
    assign: 1,
    updatedAt: '2024-07-03',
  },
  {
    id: 2,
    name: 'Member 2',
    capacity: 2,
    createdAt: '2024-07-01',
    area: [],
    total: 3,
    week: 2,
    ng_rate: 0.2,
    assign: 1,
    updatedAt: '2024-07-03',
  },
];

const mockAreas: Area[] = [
  { id: 1, name: 'エリアA' },
];

// SWRモック用のレスポンス設定
let membersData: MemberStatus[] | undefined = mockMemberStatus;
let areasLoading = false;
const mockMutate = jest.fn((fn, options) => {
  if (typeof fn === 'function') {
    membersData = fn(membersData);
  }
  return Promise.resolve(membersData);
});

// モック関数
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowErrorWithRetry = jest.fn();
const mockUpdateAccount = jest.fn();

// SWRモック
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key: string) => {
    if (key === 'members') {
      return {
        data: membersData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      };
    }
    if (key === 'areas') {
      return {
        data: areasLoading ? undefined : mockAreas,
        error: undefined,
        isLoading: areasLoading,
        mutate: jest.fn(),
      };
    }
    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: jest.fn(),
    };
  }),
}));

// MemberCardモック - onEdit, onDelete propsを使用
jest.mock('@/src/components/MemberCard', () => {
  return function MockMemberCard({
    member,
    onDelete,
    onEdit,
  }: {
    member: MemberStatus;
    onDelete: (id: number) => void;
    onEdit: (member: MemberStatus) => void;
  }) {
    return (
      <div data-testid={`member-card-${member.id}`}>
        {member.name}
        <button
          aria-label={`delete${member.id}`}
          onClick={() => onDelete(member.id)}
        >
          Delete
        </button>
        <button
          aria-label={`edit${member.id}`}
          onClick={() => onEdit(member)}
        >
          Edit
        </button>
      </div>
    );
  };
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

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// MemberEditDialogモック
let capturedOnSave: ((name: string, areaIds: number[], capacity: number) => Promise<void>) | null = null;
jest.mock('@/src/components/MemberEditDialog', () => {
  return function MockMemberEditDialog({
    open,
    onSave,
  }: {
    open: boolean;
    onSave: (name: string, areaIds: number[], capacity: number) => Promise<void>;
  }) {
    capturedOnSave = onSave;
    if (!open) return null;
    return (
      <div data-testid="member-edit-dialog">
        <button
          data-testid="save-button"
          onClick={() => void onSave('Test User', [1], 5)}
        >
          Save
        </button>
      </div>
    );
  };
});

jest.mock('@/src/util/safe-logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

import Members from '@/src/app/(admin)/members/page';

describe('Members Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    membersData = [...mockMemberStatus];
    areasLoading = false;
  });

  it('renders the component and fetches member status', async () => {
    render(<Members />);

    await waitFor(() => {
      expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
    });

    expect(screen.getByText('撮影者を追加')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-2')).toBeInTheDocument();
  });

  it('handles member deletion', async () => {
    render(<Members />);

    await waitFor(() => {
      expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('delete1'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('削除時にサーバー再検証オプションが渡される', async () => {
    render(<Members />);

    await waitFor(() => {
      expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('delete1'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.any(Function),
        { revalidate: true },
      );
    });
  });

  describe('編集機能', () => {
    it('エリア読み込み中はページがローディング状態で編集ボタンが表示されない', async () => {
      areasLoading = true;
      render(<Members />);

      // ページがローディング状態であることを確認
      await waitFor(() => {
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
      });

      // メンバーカードが表示されないため編集ボタンもない
      expect(screen.queryByLabelText('edit1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('member-edit-dialog')).not.toBeInTheDocument();
    });

    it('編集ボタンクリックでダイアログが開く', async () => {
      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('edit1'));

      await waitFor(() => {
        expect(screen.getByTestId('member-edit-dialog')).toBeInTheDocument();
      });
    });

    it('更新成功時に成功トーストが表示される', async () => {
      mockUpdateAccount.mockResolvedValue({ success: true });

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('edit1'));

      await waitFor(() => {
        expect(screen.getByTestId('member-edit-dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith('メンバーを更新しました');
      });
    });

    it('更新失敗時にリトライ付きエラートーストが表示される', async () => {
      mockUpdateAccount.mockResolvedValue({ success: false, error: '更新に失敗しました' });

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('edit1'));

      await waitFor(() => {
        expect(screen.getByTestId('member-edit-dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockShowErrorWithRetry).toHaveBeenCalledWith(
          '更新に失敗しました',
          expect.any(Function),
        );
      });
    });

    it('予期せぬエラー発生時に適切なエラーメッセージが表示される', async () => {
      mockUpdateAccount.mockRejectedValue(new Error('Unexpected error'));

      render(<Members />);

      await waitFor(() => {
        expect(screen.getByText('2名の撮影者が登録されています')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('edit1'));

      await waitFor(() => {
        expect(screen.getByTestId('member-edit-dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          '予期せぬエラーが発生しました。ページを再読み込みしてください。',
        );
      });
    });
  });
});
