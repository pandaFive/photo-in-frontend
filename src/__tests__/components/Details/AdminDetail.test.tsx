import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDetail from '@/src/components/Details/AdminDetail';

// useToastをモック
jest.mock('@/src/context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showErrorWithRetry: jest.fn(),
    removeToast: jest.fn(),
    toasts: [],
  }),
}));

// モックの準備
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/src/components/CommentList', () => {
  return function DummyCommentList() {
    return <div data-testid="comment-list">CommentList</div>;
  };
});

jest.mock('@/src/components/LoadCircle', () => {
  return function DummyLoadCircle() {
    return <div data-testid="load-circle">LoadCircle</div>;
  };
});

// useTaskMutationのモック
const mockReassign = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/src/mutations', () => ({
  useTaskMutation: () => ({
    completeTask: jest.fn(),
    markAsNG: jest.fn(),
    reassign: mockReassign,
    isPending: jest.fn().mockReturnValue(false),
  }),
}));

describe('AdminDetail', () => {
  // mutateモック: 第一引数が関数の場合は実行してfetch呼び出しをトリガー
  const mockMutate = jest.fn(async (fn) => {
    if (typeof fn === 'function') {
      await fn([]);
    }
  });

  // テストで使用するプロップス
  const mockProps = {
    account: { id: 1, name: 'Test User', area: [], role: 'admin', token: '' },
    comments: [],
    cycleId: 1,
    isLoaded: true,
    url: 'https://example.com',
    date: '2023-01-01',
    id: '123',
    dataType: 'OK',
    reload: jest.fn(),
    mutate: mockMutate,
    taskId: 123,
  };

  beforeEach(() => {
    mockMutate.mockClear();
    mockReassign.mockClear();
  });

  it('renders correctly when loaded', () => {
    render(<AdminDetail {...mockProps} />);

    expect(screen.getByText('Open File in New Tab')).toBeInTheDocument();
    expect(screen.getByText('登録日時：2023-01-01')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
  });

  it('shows LoadCircle when not loaded', () => {
    render(<AdminDetail {...mockProps} isLoaded={false} />);

    expect(screen.getByTestId('load-circle')).toBeInTheDocument();
  });

  it('shows reassign button for NG dataType', () => {
    render(<AdminDetail {...mockProps} dataType="NG" />);

    expect(screen.getByText('再アサイン')).toBeInTheDocument();
  });

  it('does not show reassign button for non-NG dataType', () => {
    render(<AdminDetail {...mockProps} />);

    expect(screen.queryByText('再アサイン')).not.toBeInTheDocument();
  });

  it('calls reassign when reassign button is clicked', async () => {
    render(<AdminDetail {...mockProps} dataType="NG" />);

    const reassignButton = screen.getByText('再アサイン');
    fireEvent.click(reassignButton);

    await waitFor(() => {
      expect(mockReassign).toHaveBeenCalledWith(123, '123');
    });
  });
});
