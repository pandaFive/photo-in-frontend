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
const mockMutate = jest.fn((fn) => {
  if (typeof fn === 'function') {
    membersData = fn(membersData);
  }
});

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
        data: mockAreas,
        error: undefined,
        isLoading: false,
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

// MemberCardモック - onEdit propを追加
jest.mock('@/src/components/MemberCard', () => {
  return function MockMemberCard({
    member,
    handleDelete,
    onEdit,
  }: {
    member: MemberStatus;
    handleDelete: (id: number) => void;
    onEdit: (member: MemberStatus) => void;
  }) {
    return (
      <div data-testid={`member-card-${member.id}`}>
        {member.name}
        <button
          aria-label={`delete${member.id}`}
          onClick={() => handleDelete(member.id)}
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
    updateAccount: jest.fn(),
    deleteAccount: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showErrorWithRetry: jest.fn(),
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

import Members from '@/src/app/(admin)/members/page';

describe('Members Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    membersData = [...mockMemberStatus];
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
});
