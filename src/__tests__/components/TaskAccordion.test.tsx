import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskAccordion from '@/src/components/TaskAccordion';
import { AccountData, Task } from '@/src/types';

// モックの関数とデータを準備
const mockFetch = jest.fn();
global.fetch = mockFetch;

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

describe('TaskAccordion', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockReload.mockClear();
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
      />,
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('expands accordion and fetches data on click', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve('http://example.com/file'),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve([{ id: 1, content: 'Test Comment' }]),
      });

    render(
      <TaskAccordion
        account={mockAccount}
        task={mockTask}
        index={0}
        type="member"
        dataType="test"
        reload={mockReload}
      />,
    );

    const accordionSummary = screen.getByRole('button');
    fireEvent.click(accordionSummary);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/aws?key=Test Task',
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/comments?taskId=1&accountId=1',
        expect.any(Object),
      );
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
      />,
    );

    // MemberDetailコンポーネントの特定の要素をチェック
    expect(screen.getByText('Open File in New Tab')).toBeInTheDocument();
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
      />,
    );

    // AdminDetailコンポーネントの特定の要素をチェック
    // 注意: これはAdminDetailコンポーネントの実装に依存します
    expect(screen.getByText('Open File in New Tab')).toBeInTheDocument();
  });
});
