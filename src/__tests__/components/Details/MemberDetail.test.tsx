import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberDetail from '@/src/components/Details/MemberDetail';

import { Comment } from '@/src/types';

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

// フェッチのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
) as jest.Mock;

describe('MemberDetail', () => {
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
  };

  it('renders correctly when loaded', () => {
    render(<MemberDetail {...mockProps} />);

    expect(screen.getByText('Open File in New Tab')).toBeInTheDocument();
    expect(screen.getByText('振り分け日時：2023-01-01')).toBeInTheDocument();
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('NG')).toBeInTheDocument();
  });

  it('renders LoadCircle when not loaded', () => {
    render(<MemberDetail {...mockProps} isLoaded={false} />);

    expect(screen.getByTestId('load-circle')).toBeInTheDocument();
  });

  it('calls changeComplete when Complete button is clicked', async () => {
    render(<MemberDetail {...mockProps} />);

    fireEvent.click(screen.getByText('Complete'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/task/1/complete', {
        method: 'PUT',
      });
      expect(mockProps.reload).toHaveBeenCalledWith('active');
    });
  });

  it('calls changeNG when NG button is clicked', async () => {
    render(<MemberDetail {...mockProps} />);

    fireEvent.click(screen.getByText('NG'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/task/1/ng', {
        method: 'PUT',
      });
      expect(mockProps.reload).toHaveBeenCalledWith('active');
    });
  });
});
