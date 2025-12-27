import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountCreate from '@/src/app/(admin)/account/create/page';
import { singUpAction } from '@/src/util/actions/signUp';

// ERR-004: SignUpResult型に合わせたモック
jest.mock('@/src/util/actions/signUp', () => ({
  singUpAction: jest.fn().mockResolvedValue({ success: true }),
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

  // ERR-004: サーバーからのエラーが表示されることを確認
  test('shows server error when signup fails', async () => {
    const mockSignUpAction = singUpAction as jest.Mock;
    mockSignUpAction.mockResolvedValueOnce({
      success: false,
      error: 'アカウント名が既に使用されています',
    });

    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(capacityInput, { target: { value: '5' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('アカウント名が既に使用されています'),
      ).toBeInTheDocument();
    });
  });

  // ERR-004: サーバーがデフォルトエラーメッセージを返した場合
  // TYPE-001: 判別共用体により、success: falseの場合はerrorが必須
  test('shows default error message from server', async () => {
    const mockSignUpAction = singUpAction as jest.Mock;
    mockSignUpAction.mockResolvedValueOnce({
      success: false,
      error: 'アカウント作成に失敗しました', // 判別共用体によりerrorは必須
    });

    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(capacityInput, { target: { value: '5' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('アカウント作成に失敗しました'),
      ).toBeInTheDocument();
    });
  });

  // ERR-004: ネットワークエラー等の例外発生時のエラー表示
  test('shows error when signup action throws exception', async () => {
    const mockSignUpAction = singUpAction as jest.Mock;
    mockSignUpAction.mockRejectedValueOnce(new Error('Network error'));

    render(<AccountCreate />);
    const nameInput = screen.getByPlaceholderText('例: 山田太郎');
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const capacityInput = screen.getByRole('spinbutton');
    const submitButton = screen.getByRole('button', { name: /アカウントを作成/i });

    fireEvent.change(nameInput, { target: { value: 'TestUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(capacityInput, { target: { value: '5' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('アカウント作成に失敗しました'),
      ).toBeInTheDocument();
    });
  });
});
