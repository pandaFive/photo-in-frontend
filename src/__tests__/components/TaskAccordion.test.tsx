import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskAccordion from '@/src/components/TaskAccordion';
import { AccountData, Task } from '@/src/types';

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

// useTaskDetailをモック（SWR版）
const mockDetailMutate = jest.fn();
jest.mock('@/src/queries', () => ({
  useTaskDetail: jest.fn((_taskId, _taskTitle, _accountId, _shouldFetch) => ({
    fileUrl: 'http://example.com/file',
    comments: [{ id: 1, content: 'Test Comment' }],
    isLoaded: true,
    isLoading: false,
    fileUrlError: null,
    commentsError: null,
    mutate: mockDetailMutate,
  })),
}));

// テスト用にモックをインポート
import { useTaskDetail } from '@/src/queries';
const mockUseTaskDetail = useTaskDetail as jest.Mock;

const mockAccount: AccountData = {
  id: 1,
  name: '',
  role: '',
  area: [],
  token: '',
};

const mockTask: Task = {
  id: 1,
  task_title: 'Test Task',
  area_name: 'Test Area',
  assign_cycle_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  history_id: 1,
};

const mockReload = jest.fn();
const mockListMutate = jest.fn();

describe('TaskAccordion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskDetail.mockReturnValue({
      fileUrl: 'http://example.com/file',
      comments: [{ id: 1, content: 'Test Comment' }],
      isLoaded: true,
      isLoading: false,
      fileUrlError: null,
      commentsError: null,
      mutate: mockDetailMutate,
    });
  });

  test('renders TaskAccordion correctly', () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('calls useTaskDetail with shouldFetch=false initially (accordion closed)', () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // 初期状態ではshouldFetch=falseで呼ばれる
    expect(mockUseTaskDetail).toHaveBeenCalledWith(
      mockTask.id,
      mockTask.task_title,
      mockAccount.id,
      false,
    );
  });

  test('calls useTaskDetail with shouldFetch=true when accordion is expanded', () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    const accordionSummary = screen.getByRole('button');
    fireEvent.click(accordionSummary);

    // 展開後はshouldFetch=trueで呼ばれる
    expect(mockUseTaskDetail).toHaveBeenLastCalledWith(
      mockTask.id,
      mockTask.task_title,
      mockAccount.id,
      true,
    );
  });

  test('renders MemberDetail for member type', () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // MemberDetailコンポーネントの特定の要素をチェック
    expect(screen.getByText('ファイルを開く')).toBeInTheDocument();
  });

  test('renders AdminDetail for admin type', () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="admin"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // AdminDetailコンポーネントの特定の要素をチェック
    expect(screen.getByText('ファイルを開く')).toBeInTheDocument();
  });

  test('displays error message and retry button when comments error occurs', () => {
    mockUseTaskDetail.mockReturnValue({
      fileUrl: 'http://example.com/file',
      comments: [],
      isLoaded: true,
      isLoading: false,
      fileUrlError: null,
      commentsError: 'コメントの取得に失敗しました',
      mutate: mockDetailMutate,
    });

    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // コメントエラーメッセージが表示される
    expect(screen.getByText('コメントの取得に失敗しました。')).toBeInTheDocument();
    // 再試行ボタンが表示される
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  test('displays file URL error separately from comments', () => {
    mockUseTaskDetail.mockReturnValue({
      fileUrl: '',
      comments: [{ id: 1, content: 'Test Comment' }],
      isLoaded: true,
      isLoading: false,
      fileUrlError: 'ファイルURLの取得に失敗しました',
      commentsError: null,
      mutate: mockDetailMutate,
    });

    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // ファイルURLエラーメッセージが表示される
    expect(screen.getByText('ファイルURLの取得に失敗しました。')).toBeInTheDocument();
    // コメントは正常に表示される（CommentListがレンダリングされる）
    expect(screen.getByText('Add comment')).toBeInTheDocument();
  });

  test('calls mutate when retry button is clicked', () => {
    mockUseTaskDetail.mockReturnValue({
      fileUrl: '',
      comments: [],
      isLoaded: true,
      isLoading: false,
      fileUrlError: null,
      commentsError: 'エラーが発生しました',
      mutate: mockDetailMutate,
    });

    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // 再試行ボタンをクリック
    const retryButton = screen.getByText('再試行');
    fireEvent.click(retryButton);

    // mutateが呼ばれる
    expect(mockDetailMutate).toHaveBeenCalled();
  });

  test('displays loading indicator when isLoaded is false and no error', () => {
    mockUseTaskDetail.mockReturnValue({
      fileUrl: '',
      comments: [],
      isLoaded: false,
      isLoading: true,
      fileUrlError: null,
      commentsError: null,
      mutate: mockDetailMutate,
    });

    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockListMutate}
        taskId={mockTask.id}
      />,
    );

    // アコーディオンを展開してコンテンツを表示
    const accordionSummary = screen.getByRole('button');
    fireEvent.click(accordionSummary);

    // ローディング中はファイルを開くボタンは表示されるが、コメントリストはローディング中
    // LoadCircleコンポーネントがレンダリングされる（role="progressbar"を持つ）
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
