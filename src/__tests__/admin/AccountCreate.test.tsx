import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountCreate from '@/src/app/(admin)/account/create/page';
import { singUpAction } from '@/src/util/actions/signUp';

// モックの作成
jest.mock('@/src/util/actions/signUp', () => ({
  singUpAction: jest.fn().mockResolvedValue(undefined),
}));

// AreaListCheckモック - チェックボックスを含む
jest.mock('@/src/components/AreaListCheck', () => () => (
  <div data-testid="area-list-check">
    <input name="option" type="checkbox" value="Area1" defaultChecked />
  </div>
));

jest.mock('@/src/components/RoleRadioButton', () => () => (
  <div data-testid="role-radio-button">
    <input name="role" type="radio" value="member" defaultChecked />
  </div>
));

describe('AccountCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component', () => {
    render(<AccountCreate />);
    expect(screen.getByText('新規アカウント作成')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(<AccountCreate />);
    expect(screen.getByText('アカウント名')).toBeInTheDocument();
    expect(screen.getByText('パスワード')).toBeInTheDocument();
    expect(screen.getByText('1日あたりのキャパシティ')).toBeInTheDocument();
    expect(screen.getByText('撮影可能エリア')).toBeInTheDocument();
    expect(screen.getByText('権限')).toBeInTheDocument();
  });

  test('renders AreaListCheck and RoleRadioButton components', () => {
    render(<AccountCreate />);
    expect(screen.getByTestId('area-list-check')).toBeInTheDocument();
    expect(screen.getByTestId('role-radio-button')).toBeInTheDocument();
  });

  test('shows error when name is empty', async () => {
    render(<AccountCreate />);
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('アカウント名を入力してください'),
      ).toBeInTheDocument();
    });
  });

  test('shows error when password is too short', async () => {
    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('パスワードは8文字以上で入力してください'),
      ).toBeInTheDocument();
    });
  });

  test('shows error when capacity is invalid', async () => {
    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(capacityInput, { target: { value: '0' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('キャパシティは1以上を入力してください'),
      ).toBeInTheDocument();
    });
  });

  test('submits form with correct data', async () => {
    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    // 必須フィールドを入力
    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(capacityInput, { target: { value: '5' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(singUpAction).toHaveBeenCalledWith(expect.any(FormData));
    });
  });
});
