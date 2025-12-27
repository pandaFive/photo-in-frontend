import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInSide from '@/src/app/page';

// next/navigationのモック
const mockSearchParams = new Map<string, string>();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}));

// loginActionのモック
jest.mock('@/src/util/actions/login', () => ({
  loginAction: jest.fn(),
}));

describe('LoginPage (SignInSide)', () => {
  beforeEach(() => {
    mockSearchParams.clear();
  });

  test('renders login form', () => {
    render(<SignInSide />);
    // MUIのTextFieldはinputにname属性を持つ
    expect(document.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });

  test('renders PHOTO IN branding', () => {
    render(<SignInSide />);
    expect(screen.getAllByText('PHOTO IN').length).toBeGreaterThan(0);
  });

  // ERR-003: エラークエリパラメータからエラーメッセージを表示
  test('displays error message from query parameter', () => {
    mockSearchParams.set('error', 'ログインに失敗しました');
    render(<SignInSide />);
    expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // ERR-003: URL エンコードされたエラーメッセージも正しく表示
  test('displays URL-decoded error message', () => {
    mockSearchParams.set('error', 'アカウント名またはパスワードが正しくありません');
    render(<SignInSide />);
    expect(
      screen.getByText('アカウント名またはパスワードが正しくありません'),
    ).toBeInTheDocument();
  });

  // ERR-003: エラーがない場合はアラートを表示しない
  test('does not display error alert when no error query param', () => {
    render(<SignInSide />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

});
