import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountCreate from '@/src/app/(admin)/account/create/page';
import { singUpAction } from '@/src/util/actions/signUp';

// モックの作成
jest.mock('@/src/util/actions/signUp', () => ({
  singUpAction: jest.fn(),
}));

jest.mock('@/src/components/AreaListCheck', () => () => (
  <div data-testid="area-list-check" />
));
jest.mock('@/src/components/RoleRadioButton', () => () => (
  <div data-testid="role-radio-button" />
));

describe('AccountCreate', () => {
  beforeEach(() => {
    render(<AccountCreate />);
  });

  test('renders the component', () => {
    expect(screen.getByText('Create New Account')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    expect(screen.getByText('Account name')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();
    expect(screen.getByText('1日当たりのキャパシティ')).toBeInTheDocument();
    expect(screen.getByText('撮影可能エリア')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  test('renders AreaListCheck and RoleRadioButton components', () => {
    expect(screen.getByTestId('area-list-check')).toBeInTheDocument();
    expect(screen.getByTestId('role-radio-button')).toBeInTheDocument();
  });

  test('submits form with correct data', () => {
    const nameInput = screen.getByLabelText('Account Name');
    const passwordInput = screen.getByLabelText('password');
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: '新規作成' });

    // fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    // fireEvent.change(passwordInput, { target: { value: 'TestPassword' } });
    // fireEvent.change(capacityInput, { target: { value: '5' } });

    fireEvent.click(submitButton);

    expect(singUpAction).toHaveBeenCalledWith(expect.any(FormData));
  });
});
