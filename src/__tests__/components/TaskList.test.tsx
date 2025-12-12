import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '@/src/components/TaskList';
import { AccountData, Task } from '@/src/types';

// Server Actionsをモック
jest.mock('@/src/util/actions/get-member-tasks', () => ({
  getMemberAssignTask: jest.fn(),
}));

jest.mock('@/src/util/actions/get-tasks', () => ({
  getAllTasks: jest.fn(),
  getNGTasks: jest.fn(),
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

import { getMemberAssignTask } from '@/src/util/actions/get-member-tasks';
import { getAllTasks, getNGTasks } from '@/src/util/actions/get-tasks';

const mockGetMemberAssignTask = getMemberAssignTask as jest.MockedFunction<
  typeof getMemberAssignTask
>;
const mockGetAllTasks = getAllTasks as jest.MockedFunction<typeof getAllTasks>;
const mockGetNGTasks = getNGTasks as jest.MockedFunction<typeof getNGTasks>;

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
    mockGetMemberAssignTask.mockClear();
    mockGetAllTasks.mockClear();
    mockGetNGTasks.mockClear();
  });

  test('renders TaskList for member and fetches member tasks', async () => {
    mockGetMemberAssignTask.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(mockGetMemberAssignTask).toHaveBeenCalledWith('1', expect.any(AbortSignal));
    });
  });

  test('renders TaskList for admin and fetches all tasks', async () => {
    mockGetAllTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={2} account={mockAdminAccount} />);

    await waitFor(() => {
      expect(mockGetAllTasks).toHaveBeenCalledWith(expect.any(AbortSignal));
    });
  });

  test('displays loading indicator when no data', async () => {
    mockGetMemberAssignTask.mockResolvedValueOnce([]);

    render(<TaskList id={1} account={mockMemberAccount} />);

    // ロード中のインジケータが表示されることを確認
    expect(screen.getByTestId('load-circle')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetMemberAssignTask).toHaveBeenCalledWith(
        '1',
        expect.any(AbortSignal),
      );
    });
  });

  test('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockGetMemberAssignTask.mockRejectedValueOnce(new Error('Fetch failed'));

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('displays tasks after loading', async () => {
    mockGetMemberAssignTask.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
    });
  });

  test('admin can see NG button group', async () => {
    mockGetAllTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={2} account={mockAdminAccount} />);

    await waitFor(() => {
      // admin用のNGボタンが存在することを確認
      expect(screen.getByText('NG')).toBeInTheDocument();
    });
  });

  test('member cannot see NG button group', async () => {
    mockGetMemberAssignTask.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(mockGetMemberAssignTask).toHaveBeenCalled();
    });

    // member用にはNGボタンが存在しないことを確認
    expect(screen.queryByRole('button', { name: 'NG' })).not.toBeInTheDocument();
  });

  test('switches sort type', async () => {
    mockGetMemberAssignTask.mockResolvedValueOnce(mockTasks);

    render(<TaskList id={1} account={mockMemberAccount} />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    // 地域ボタンをクリック
    fireEvent.click(screen.getByText('地域'));

    // ソートタイプが変更されたことを確認（ボタンがdisabledになる）
    expect(screen.getByText('地域')).toBeDisabled();
  });
});
