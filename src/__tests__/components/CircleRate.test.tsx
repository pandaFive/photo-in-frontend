import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CircleRate from '@/src/components/CircleRate';

// Mocking @mui/material and @mui/x-charts components
jest.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Paper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('@mui/x-charts', () => ({
  Gauge: ({
    height,
    value,
    width,
  }: {
    height: number;
    value: number;
    width: number;
  }) => (
    <div
      data-testid="mock-gauge"
      data-height={height}
      data-value={value}
      data-width={width}
    />
  ),
}));

describe('CircleRate component', () => {
  const defaultProps = {
    name: 'Test Gauge',
    rate: 75,
    size: 200,
  };

  it('renders correctly with given props', () => {
    render(<CircleRate {...defaultProps} />);

    // Check if the name is rendered
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();

    // Check if the Gauge component is rendered with correct props
    const gaugeElement = screen.getByTestId('mock-gauge');
    expect(gaugeElement).toBeInTheDocument();
    expect(gaugeElement).toHaveAttribute(
      'data-height',
      defaultProps.size.toString(),
    );
    expect(gaugeElement).toHaveAttribute(
      'data-value',
      defaultProps.rate.toString(),
    );
    expect(gaugeElement).toHaveAttribute(
      'data-width',
      defaultProps.size.toString(),
    );
  });

  it('renders with different props', () => {
    const newProps = {
      name: 'Another Gauge',
      rate: 50,
      size: 150,
    };

    render(<CircleRate {...newProps} />);

    expect(screen.getByText(newProps.name)).toBeInTheDocument();

    const gaugeElement = screen.getByTestId('mock-gauge');
    expect(gaugeElement).toHaveAttribute(
      'data-height',
      newProps.size.toString(),
    );
    expect(gaugeElement).toHaveAttribute(
      'data-value',
      newProps.rate.toString(),
    );
    expect(gaugeElement).toHaveAttribute(
      'data-width',
      newProps.size.toString(),
    );
  });
});
