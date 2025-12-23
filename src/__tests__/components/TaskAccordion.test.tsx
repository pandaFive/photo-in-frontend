import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// useTaskDetailをモック
const mockFetchData = jest.fn();
const mockCleanup = jest.fn();

jest.mock('@/src/queries', () => ({
  useTaskDetail: () => ({
    fileUrl: 'http://example.com/file',
    comments: [{ id: 1, content: 'Test Comment' }],
    isLoaded: true,
    isLoading: false,
    error: null,
    fetchData: mockFetchData,
    cleanup: mockCleanup,
  }),
  isTaskDetailCached: () => false,
}));

const mockAccount: AccountData = {
  id: 1,
  name: '',
  role: '',
  area: [],
  token: '',
};

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  area_name: 'Test Area',
  assign_cycle_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  history_id: 1,
};

const mockReload = jest.fn();
const mockMutate = jest.fn();

describe('TaskAccordion', () => {
  beforeEach(() => {
    mockFetchData.mockClear();
    mockCleanup.mockClear();
    mockReload.mockClear();
    mockMutate.mockClear();
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
        mutate={mockMutate}
        taskId={mockTask.id}
      />,
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('expands accordion and fetches data on click', async () => {
    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
        mutate={mockMutate}
        taskId={mockTask.id}
      />,
    );

    const accordionSummary = screen.getByRole('button');
    fireEvent.click(accordionSummary);

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalled();
    });
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
        mutate={mockMutate}
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
        mutate={mockMutate}
        taskId={mockTask.id}
      />,
    );

    // AdminDetailコンポーネントの特定の要素をチェック
    // 注意: これはAdminDetailコンポーネントの実装に依存します
    expect(screen.getByText('ファイルを開く')).toBeInTheDocument();
  });
});
