import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentList from '@/src/components/CommentList';
import { AccountData, Comment } from '@/src/types';

// fetch-comment関数をモック
jest.mock('@/src/util/fetch-comment', () => ({
  fetchDeleteComment: jest.fn().mockResolvedValue(undefined),
  fetchPostComment: jest.fn().mockResolvedValue({ id: 999 }),
  fetchPutComment: jest.fn().mockResolvedValue(undefined),
}));

// MUI X DataGridをモック
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: unknown[];
    columns: unknown[];
  }) => (
    <div data-testid="data-grid" role="grid">
      <div>Rows: {rows?.length ?? 0}</div>
      {rows?.map((row: { id: number; comment: string }) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {row.comment}
        </div>
      ))}
    </div>
  ),
  GridRowModes: { Edit: 'edit', View: 'view' },
  GridRowEditStopReasons: { rowFocusOut: 'rowFocusOut' },
  GridToolbarContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  GridActionsCellItem: () => <button>Action</button>,
}));

const mockAccount: AccountData = {
  id: 1,
  name: 'Test User',
  role: 'member',
  area: ['TestArea'],
  token: 'test-token',
};

const mockComments: Comment[] = [
  {
    id: 1,
    name: 'User 1',
    content: 'Test comment 1',
    taskId: 1,
    updatedAt: '2023-01-01T00:00:00Z',
    accountName: 'User 1',
    role: 'member',
  },
  {
    id: 2,
    name: 'User 2',
    content: 'Test comment 2',
    taskId: 1,
    updatedAt: '2023-01-02T00:00:00Z',
    accountName: 'User 2',
    role: 'admin',
  },
];

describe('CommentList', () => {
  test('renders CommentList correctly', () => {
    render(
      <CommentList account={mockAccount} comments={mockComments} cycleId={1} />,
    );

    // DataGridが正しくレンダリングされることを確認
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  test('displays comments in the grid', () => {
    render(
      <CommentList account={mockAccount} comments={mockComments} cycleId={1} />,
    );

    // コメントが表示されることを確認
    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
  });

  test('handles empty comments list', () => {
    render(<CommentList account={mockAccount} comments={[]} cycleId={1} />);

    // 空のグリッドが表示されることを確認
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    expect(screen.getByText('Rows: 0')).toBeInTheDocument();
  });

  test('displays correct number of rows', () => {
    render(
      <CommentList account={mockAccount} comments={mockComments} cycleId={1} />,
    );

    // 正しい数の行が表示されることを確認
    expect(screen.getByText('Rows: 2')).toBeInTheDocument();
  });

  test('renders with admin account', () => {
    const adminAccount: AccountData = {
      ...mockAccount,
      role: 'admin',
    };

    render(
      <CommentList account={adminAccount} comments={mockComments} cycleId={1} />,
    );

    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });

  test('renders with different cycleId', () => {
    render(
      <CommentList
        account={mockAccount}
        comments={mockComments}
        cycleId={999}
      />,
    );

    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });
});
