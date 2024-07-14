import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Members from '@/src/app/(admin)/members/page';
import { getAccountStatus } from '@/src/api/get-account-status';
import { MemberStatus } from '@/src/types';

// モックの設定
jest.mock('@/src/api/get-account-status');
jest.mock('@/src/components/MemberCard', () => {
  return function MockMemberCard({ member, handleDelete }) {
    return (
      <div data-testid={`member-card-${member.id}`}>
        {member.name}
        <button
          aria-label={`delete${member.id}`}
          onClick={() => handleDelete(member.id)}
        >
          Delete
        </button>
      </div>
    );
  };
});

const mockMemberStatus: MemberStatus[] = [
  {
    id: 1,
    name: 'Member 1',
    capacity: 2,
    createdAt: '2024-07-01',
    area: [],
    total: 3,
    week: 2,
    ng_rate: 0.2,
    assign: 1,
    updatedAt: '2024-07-03',
  },
  {
    id: 2,
    name: 'Member 2',
    capacity: 2,
    createdAt: '2024-07-01',
    area: [],
    total: 3,
    week: 2,
    ng_rate: 0.2,
    assign: 1,
    updatedAt: '2024-07-03',
  },
];

describe('Members Component', () => {
  beforeEach(() => {
    (getAccountStatus as jest.Mock).mockResolvedValue(mockMemberStatus);
  });

  it('renders the component and fetches member status', async () => {
    render(<Members />);

    await waitFor(() => {
      expect(screen.getByText('現在の撮影者数：2')).toBeInTheDocument();
    });

    expect(screen.getByText('撮影者を追加する')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-card-2')).toBeInTheDocument();
  });

  it('handles member deletion', async () => {
    render(<Members />);

    await waitFor(() => {
      expect(screen.getByText('現在の撮影者数：2')).toBeInTheDocument();
    });

    // fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByLabelText('delete1'));

    await waitFor(() => {
      expect(screen.getByText('現在の撮影者数：1')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('member-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('member-card-2')).toBeInTheDocument();
  });
});
