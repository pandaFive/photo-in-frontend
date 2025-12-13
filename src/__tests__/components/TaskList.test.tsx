import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '@/src/components/TaskList';
import { AccountData, Task } from '@/src/types';

// useTaskListDataをモック
const mockMutate = jest.fn();
const mockChangeDataType = jest.fn();
const mockUseTaskListData = jest.fn();

jest.mock('@/src/util/hooks/useTaskListData', () => ({
  useTaskListData: (params: unknown) => mockUseTaskListData(params),
}));

// TaskAccordionをモック
jest.mock('@/src/components/TaskAccordion', () => {
  return function MockTaskAccordion({ task }: { task: Task }) {
    return <div data-testid={`task-${task.id}`}>{task.title}</div>;
  };
});

// LoadCircleをモック
jest.mock('@/src/components/LoadCircle', () => {
  return function MockLoadCircle() {
    return <div data-testid="load-circle">Loading...</div>;
  };
});

const mockMemberAccount: AccountData = {
  id: 1,
  name: 'Test Member',
  role: 'member',
  area: ['TestArea'],
  token: 'test-token',
};

const mockAdminAccount: AccountData = {
  id: 2,
  name: 'Test Admin',
  role: 'admin',
  area: ['TestArea'],
  token: 'test-token',
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Task 1',
    area_name: 'Area A',
    assign_cycle_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    history_id: 1,
  },
  {
    id: 2,
    title: 'Task 2',
    area_name: 'Area B',
    assign_cycle_id: 2,
    created_at: '2023-01-02T00:00:00Z',
    history_id: 2,
  },
];

describe('TaskList', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockChangeDataType.mockClear();
    mockUseTaskListData.mockClear();
  });

  test('renders TaskList for member and fetches member tasks', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(mockUseTaskListData).toHaveBeenCalledWith({
        account: mockMemberAccount,
        id: 1,
      });
    });
  });

  test('renders TaskList for admin and fetches all tasks', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={2} account={mockAdminAccount} />);

    await waitFor(() => {
      expect(mockUseTaskListData).toHaveBeenCalledWith({
        account: mockAdminAccount,
        id: 2,
      });
    });
  });

  test('displays loading indicator when loading', async () => {
    mockUseTaskListData.mockReturnValue({
      data: [],
      dataType: 'active',
      isLoading: true,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    expect(screen.getByTestId('load-circle')).toBeInTheDocument();
  });

  test('handles fetch error gracefully', async () => {
    mockUseTaskListData.mockReturnValue({
      data: [],
      dataType: 'active',
      isLoading: false,
      error: 'タスクの取得に失敗しました',
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(screen.getByText('タスクの取得に失敗しました')).toBeInTheDocument();
    });
  });

  test('displays tasks after loading', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
    });
  });

  test('admin can see NG button group', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={2} account={mockAdminAccount} />);

    await waitFor(() => {
      expect(screen.getByText('NG')).toBeInTheDocument();
    });
  });

  test('member cannot see NG button group', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(mockUseTaskListData).toHaveBeenCalled();
    });

    expect(screen.queryByRole('button', { name: 'NG' })).not.toBeInTheDocument();
  });

  test('switches sort type', async () => {
    mockUseTaskListData.mockReturnValue({
      data: mockTasks,
      dataType: 'active',
      isLoading: false,
      error: null,
      changeDataType: mockChangeDataType,
      mutate: mockMutate,
    });

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('地域'));

    expect(screen.getByText('地域')).toBeDisabled();
  });
});
