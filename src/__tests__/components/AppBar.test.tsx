import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import AppBar from '@/src/components/AppBar';
import { logoutAction } from '@/src/util/actions/logout';

// モック設定
jest.mock('@/src/util/actions/logout', () => ({
  logoutAction: jest.fn(),
}));

const mockLogoutAction = logoutAction as jest.MockedFunction<typeof logoutAction>;

describe('AppBar', () => {
  const defaultProps = {
    toggleDrawer: jest.fn(),
    open: false,
    name: 'テストユーザー',
    role: 'member',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    test('ユーザー名が表示される', () => {
      render(<AppBar {...defaultProps} />);

      expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    });

    test('ユーザーのイニシャルがAvatarに表示される', () => {
      render(<AppBar {...defaultProps} name="山田太郎" />);

      expect(screen.getByText('山')).toBeInTheDocument();
    });

    test('英語名の場合、大文字のイニシャルが表示される', () => {
      render(<AppBar {...defaultProps} name="john" />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('ログアウトボタンが表示される', () => {
      render(<AppBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'logout' })).toBeInTheDocument();
    });
  });

  describe('ロール表示', () => {
    test('メンバーの場合「メンバー」と表示される', () => {
      render(<AppBar {...defaultProps} role="member" />);

      expect(screen.getByText('メンバー')).toBeInTheDocument();
    });

    test('管理者の場合「管理者」と表示される', () => {
      render(<AppBar {...defaultProps} role="admin" />);

      expect(screen.getByText('管理者')).toBeInTheDocument();
    });

    test('不明なロールの場合「メンバー」と表示される', () => {
      render(<AppBar {...defaultProps} role="unknown" />);

      expect(screen.getByText('メンバー')).toBeInTheDocument();
    });
  });

  describe('メニューボタン（管理者のみ）', () => {
    test('管理者の場合、メニューボタンが表示される', () => {
      render(<AppBar {...defaultProps} role="admin" />);

      expect(screen.getByRole('button', { name: 'open drawer' })).toBeInTheDocument();
    });

    test('メンバーの場合、メニューボタンは表示されない', () => {
      render(<AppBar {...defaultProps} role="member" />);

      expect(screen.queryByRole('button', { name: 'open drawer' })).not.toBeInTheDocument();
    });

    test('メニューボタンをクリックするとtoggleDrawerが呼ばれる', () => {
      const toggleDrawer = jest.fn();
      render(<AppBar {...defaultProps} role="admin" toggleDrawer={toggleDrawer} />);

      fireEvent.click(screen.getByRole('button', { name: 'open drawer' }));

      expect(toggleDrawer).toHaveBeenCalledTimes(1);
    });

    test('ドロワーが開いているときはメニューボタンが非表示になる', () => {
      const { container } = render(<AppBar {...defaultProps} role="admin" open={true} />);

      // display: noneスタイルが適用されるとアクセシビリティツリーから除外される
      // aria-labelで直接DOM要素を検索
      const menuButton = container.querySelector('[aria-label="open drawer"]');
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveStyle({ display: 'none' });
    });
  });

  describe('ログアウトダイアログ', () => {
    test('初期状態ではダイアログは表示されない', () => {
      render(<AppBar {...defaultProps} />);

      expect(screen.queryByText('ログアウトしてもよろしいですか？')).not.toBeInTheDocument();
    });

    test('ログアウトボタンをクリックするとダイアログが表示される', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        expect(screen.getByText('ログアウトしてもよろしいですか？')).toBeInTheDocument();
      });
    });

    test('ダイアログにキャンセルボタンがある', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });
    });

    test('ダイアログにログアウトボタンがある', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
      });
    });

    test('キャンセルボタンをクリックするとダイアログが閉じる', async () => {
      render(<AppBar {...defaultProps} />);

      // ダイアログを開く
      fireEvent.click(screen.getByRole('button', { name: 'logout' }));
      await waitFor(() => {
        expect(screen.getByText('ログアウトしてもよろしいですか？')).toBeInTheDocument();
      });

      // キャンセルボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

      await waitFor(() => {
        expect(screen.queryByText('ログアウトしてもよろしいですか？')).not.toBeInTheDocument();
      });
    });

    test('ログアウトボタンをクリックするとlogoutActionが呼ばれる', async () => {
      render(<AppBar {...defaultProps} />);

      // ダイアログを開く
      fireEvent.click(screen.getByRole('button', { name: 'logout' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument();
      });

      // ログアウトボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

      expect(mockLogoutAction).toHaveBeenCalledTimes(1);
    });

    test('ダイアログのタイトルが「ログアウト」', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'ログアウト' })).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    test('ログアウトボタンにaria-labelがある', () => {
      render(<AppBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'logout' })).toHaveAttribute('aria-label', 'logout');
    });

    test('管理者の場合、メニューボタンにaria-labelがある', () => {
      render(<AppBar {...defaultProps} role="admin" />);

      expect(screen.getByRole('button', { name: 'open drawer' })).toHaveAttribute('aria-label', 'open drawer');
    });

    test('ダイアログにaria-labelledbyがある', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby', 'logout-dialog-title');
      });
    });

    test('ダイアログにaria-describedbyがある', async () => {
      render(<AppBar {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'logout' }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-describedby', 'logout-dialog-description');
      });
    });
  });

  describe('エッジケース', () => {
    test('空のユーザー名でもクラッシュしない', () => {
      render(<AppBar {...defaultProps} name="" />);

      // 空文字のcharAt(0)は空文字を返す
      expect(screen.getByRole('button', { name: 'logout' })).toBeInTheDocument();
    });

    test('長いユーザー名でも表示される', () => {
      const longName = 'とても長いユーザー名を持つテストユーザー';
      render(<AppBar {...defaultProps} name={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    test('特殊文字を含むユーザー名でも表示される', () => {
      render(<AppBar {...defaultProps} name="user@example.com" />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });
});
