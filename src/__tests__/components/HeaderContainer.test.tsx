import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderContainer from '@/src/components/HeaderContainer';

// AppBarとDrawerのモックを作成
jest.mock('@/src/components/AppBar', () => {
  return function MockAppBar({ name, open, role, toggleDrawer }) {
    return (
      <div data-testid="app-bar">
        AppBar: {name}, {role}, {open.toString()}
        <button onClick={toggleDrawer}>Toggle</button>
      </div>
    );
  };
});

jest.mock('@/src/components/Drawer', () => {
  return function MockDrawer({ open, toggleDrawer }) {
    return <div data-testid="drawer">Drawer: {open.toString()}</div>;
  };
});

describe('HeaderContainer', () => {
  it('renders AppBar with correct props', () => {
    render(<HeaderContainer name="John" role="user" />);
    expect(screen.getByTestId('app-bar')).toHaveTextContent(
      'AppBar: John, user, false',
    );
  });

  it('does not render Drawer for non-admin role', () => {
    render(<HeaderContainer name="John" role="user" />);
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('renders Drawer for admin role', () => {
    render(<HeaderContainer name="Admin" role="admin" />);
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('toggles open state when AppBar toggle button is clicked', () => {
    render(<HeaderContainer name="John" role="admin" />);
    const toggleButton = screen.getByText('Toggle');

    fireEvent.click(toggleButton);
    expect(screen.getByTestId('app-bar')).toHaveTextContent(
      'AppBar: John, admin, true',
    );
    expect(screen.getByTestId('drawer')).toHaveTextContent('Drawer: true');

    fireEvent.click(toggleButton);
    expect(screen.getByTestId('app-bar')).toHaveTextContent(
      'AppBar: John, admin, false',
    );
    expect(screen.getByTestId('drawer')).toHaveTextContent('Drawer: false');
  });
});
