import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberDetail from '@/src/components/Details/MemberDetail';

import { Comment } from '@/src/types';

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
const mockCompleteTask = jest.fn().mockResolvedValue({ success: true });
const mockMarkAsNG = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/src/mutations', () => ({
  useTaskMutation: () => ({
    completeTask: mockCompleteTask,
    markAsNG: mockMarkAsNG,
    reassign: jest.fn(),
    isPending: jest.fn().mockReturnValue(false),
  }),
}));

describe('MemberDetail', () => {
  const mockMutate = jest.fn();

  const mockProps = {
    account: {
      id: 1,
      name: 'Test User',
      area: [],
      role: 'member',
      token: '',
    },
    comments: [] as Comment[],
    isLoaded: true,
    id: '1',
    cycleId: 1,
    url: 'https://example.com',
    date: '2023-01-01',
    reload: jest.fn(),
    mutate: mockMutate,
    taskId: 1,
  };

  beforeEach(() => {
    mockMutate.mockClear();
    mockCompleteTask.mockClear();
    mockMarkAsNG.mockClear();
  });

  it('renders correctly when loaded', () => {
    render(<MemberDetail {...mockProps} />);

    expect(screen.getByText('Open File in New Tab')).toBeInTheDocument();
    expect(screen.getByText('振り分け日時：2023-01-01')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('NG')).toBeInTheDocument();
  });

  it('renders LoadCircle when not loaded', () => {
    render(<MemberDetail {...mockProps} isLoaded={false} />);

    expect(screen.getByTestId('load-circle')).toBeInTheDocument();
  });

  it('calls completeTask when 完了 button is clicked', async () => {
    render(<MemberDetail {...mockProps} />);

    fireEvent.click(screen.getByText('完了'));

    await waitFor(() => {
      expect(mockCompleteTask).toHaveBeenCalledWith(1, '1');
    });
  });

  it('calls markAsNG when NG button is clicked', async () => {
    render(<MemberDetail {...mockProps} />);

    fireEvent.click(screen.getByText('NG'));

    await waitFor(() => {
      expect(mockMarkAsNG).toHaveBeenCalledWith(1, '1');
    });
  });
});
