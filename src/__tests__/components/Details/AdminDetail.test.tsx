import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDetail from '@/src/components/Details/AdminDetail';

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

  it('calls mutate function when reassign button is clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        formData: () => Promise.resolve(new FormData()),
        headers: new Headers(),
        redirected: false,
        status: 200,
        statusText: 'OK',
        type: 'default' as ResponseType,
        url: 'https://example.com',
        clone: function () {
          return Promise.resolve(this);
        },
      } as unknown as Response),
    );

    render(<AdminDetail {...mockProps} dataType="NG" />);

    const reassignButton = screen.getByText('再アサイン');
    fireEvent.click(reassignButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/task/123/reassign', {
        method: 'PUT',
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
