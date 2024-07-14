import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AreaListCheck from '@/src/components/AreaListCheck';
import { getAreas } from '@/src/api/get-areas';

// getAreas関数をモック化
jest.mock('@/src/api/get-areas');

describe('AreaListCheck', () => {
  const mockAreas = [
    { id: 1, name: 'Area 1' },
    { id: 2, name: 'Area 2' },
    { id: 3, name: 'Area 3' },
  ];

  beforeEach(() => {
    (getAreas as jest.Mock).mockResolvedValue(mockAreas);
  });

  it('renders area checkboxes', async () => {
    render(<AreaListCheck />);

    await waitFor(() => {
      expect(screen.getByText('Area 1')).toBeInTheDocument();
      expect(screen.getByText('Area 2')).toBeInTheDocument();
      expect(screen.getByText('Area 3')).toBeInTheDocument();
    });
  });

  it('toggles checkbox when clicked', async () => {
    render(<AreaListCheck />);

    await waitFor(() => {
      const checkbox = screen.getByLabelText('Area 1');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  it('handles API error', async () => {
    console.error = jest.fn(); // コンソールエラーをモック化
    (getAreas as jest.Mock).mockRejectedValue(new Error('API error'));

    render(<AreaListCheck />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
