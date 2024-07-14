import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '@/src/app/(admin)/dashboard/page';

// モックコンポーネントを作成
jest.mock('@/src/components/Buttons/UploadButton', () => () => (
  <div data-testid="upload-button">UploadButton</div>
));
jest.mock('@/src/components/Chart', () => () => (
  <div data-testid="chart">Chart</div>
));
jest.mock('@/src/components/Orders', () => () => (
  <div data-testid="orders">Orders</div>
));
jest.mock('@/src/components/Uncompletes', () => () => (
  <div data-testid="uncompletes">Uncompletes</div>
));

describe('Dashboard Component', () => {
  it('renders without crashing', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('chart')).toBeInTheDocument();
    expect(screen.getByTestId('orders')).toBeInTheDocument();
    expect(screen.getByTestId('uncompletes')).toBeInTheDocument();
  });

  it('has the correct layout structure', () => {
    render(<Dashboard />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveStyle('background-color: #f9f9f9');
    expect(mainElement).toHaveStyle('flex-grow: 1');
    expect(mainElement).toHaveStyle('overflow: auto');
  });
});
