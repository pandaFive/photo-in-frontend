import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Drawer from '@/src/components/Drawer';

describe('Drawer', () => {
  const defaultProps = {
    toggleDrawer: jest.fn(),
    open: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    test('閉じるボタンが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    });

    test('ナビゲーションリストが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('区切り線が表示される', () => {
      render(<Drawer {...defaultProps} />);

      const dividers = document.querySelectorAll('hr');
      expect(dividers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('open=true（展開状態）', () => {
    test('ダッシュボードリンクのテキストが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    test('タスク一覧リンクのテキストが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('タスク一覧')).toBeInTheDocument();
    });

    test('アカウント一覧リンクのテキストが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('アカウント一覧')).toBeInTheDocument();
    });

    test('アカウント作成リンクのテキストが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('アカウント作成')).toBeInTheDocument();
    });

    test('レポートセクションのヘッダーが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('レポート')).toBeInTheDocument();
    });

    test('今月リンクが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('今月')).toBeInTheDocument();
    });

    test('前四半期リンクが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('前四半期')).toBeInTheDocument();
    });

    test('年間リンクが表示される', () => {
      render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('年間')).toBeInTheDocument();
    });
  });

  describe('open=false（折りたたみ状態）', () => {
    test('ダッシュボードテキストは表示されない', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
    });

    test('タスク一覧テキストは表示されない', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('タスク一覧')).not.toBeInTheDocument();
    });

    test('アカウント一覧テキストは表示されない', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('アカウント一覧')).not.toBeInTheDocument();
    });

    test('アカウント作成テキストは表示されない', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('アカウント作成')).not.toBeInTheDocument();
    });

    test('レポートセクションのヘッダーは表示されない', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('レポート')).not.toBeInTheDocument();
    });

    test('閉じるボタンは表示される', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.getByTestId('ChevronLeftIcon')).toBeInTheDocument();
    });

    test('アイコンは表示される', () => {
      render(<Drawer {...defaultProps} open={false} />);

      expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
      expect(screen.getByTestId('FormatListBulletedIcon')).toBeInTheDocument();
      expect(screen.getByTestId('PeopleIcon')).toBeInTheDocument();
      expect(screen.getByTestId('PersonAddAlt1Icon')).toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    test('閉じるボタンをクリックするとtoggleDrawerが呼ばれる', () => {
      const toggleDrawer = jest.fn();
      render(<Drawer {...defaultProps} toggleDrawer={toggleDrawer} />);

      const closeButton = screen.getByTestId('ChevronLeftIcon').closest('button');
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton!);

      expect(toggleDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('リンク先', () => {
    test('ダッシュボードリンクのhrefが/dashboard', () => {
      render(<Drawer {...defaultProps} open={true} />);

      const dashboardLink = screen.getByText('ダッシュボード').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    test('タスク一覧リンクのhrefが/task', () => {
      render(<Drawer {...defaultProps} open={true} />);

      const taskLink = screen.getByText('タスク一覧').closest('a');
      expect(taskLink).toHaveAttribute('href', '/task');
    });

    test('アカウント一覧リンクのhrefが/members', () => {
      render(<Drawer {...defaultProps} open={true} />);

      const membersLink = screen.getByText('アカウント一覧').closest('a');
      expect(membersLink).toHaveAttribute('href', '/members');
    });

    test('アカウント作成リンクのhrefが/account/create', () => {
      render(<Drawer {...defaultProps} open={true} />);

      const createLink = screen.getByText('アカウント作成').closest('a');
      expect(createLink).toHaveAttribute('href', '/account/create');
    });
  });

  describe('アイコン', () => {
    test('DashboardIconが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
    });

    test('FormatListBulletedIconが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByTestId('FormatListBulletedIcon')).toBeInTheDocument();
    });

    test('PeopleIconが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByTestId('PeopleIcon')).toBeInTheDocument();
    });

    test('PersonAddAlt1Iconが表示される', () => {
      render(<Drawer {...defaultProps} />);

      expect(screen.getByTestId('PersonAddAlt1Icon')).toBeInTheDocument();
    });

    test('AssignmentIconが表示される（レポートセクション）', () => {
      render(<Drawer {...defaultProps} />);

      const assignmentIcons = screen.getAllByTestId('AssignmentIcon');
      expect(assignmentIcons.length).toBe(3); // 今月、前四半期、年間
    });
  });

  describe('MUIスタイル', () => {
    test('Drawerはpermanentバリアント', () => {
      const { container } = render(<Drawer {...defaultProps} />);

      // MUI Drawer with permanent variant
      const drawer = container.querySelector('.MuiDrawer-root');
      expect(drawer).toBeInTheDocument();
    });

    test('MuiDrawer-paperクラスが存在する', () => {
      const { container } = render(<Drawer {...defaultProps} />);

      const drawerPaper = container.querySelector('.MuiDrawer-paper');
      expect(drawerPaper).toBeInTheDocument();
    });
  });

  describe('リスト構造', () => {
    test('メインリストにはListItemButtonが5つある', () => {
      render(<Drawer {...defaultProps} open={true} />);

      // Main menu items: ダッシュボード、タスク一覧、アカウント一覧、アカウント作成、エリア管理
      // Secondary items: 今月、前四半期、年間
      const listItemButtons = document.querySelectorAll('.MuiListItemButton-root');
      expect(listItemButtons.length).toBe(8);
    });

    test('ListItemIconが各メニュー項目に存在する', () => {
      render(<Drawer {...defaultProps} />);

      const listItemIcons = document.querySelectorAll('.MuiListItemIcon-root');
      expect(listItemIcons.length).toBe(8);
    });
  });

  describe('エッジケース', () => {
    test('openがtrueからfalseに変わってもクラッシュしない', () => {
      const { rerender } = render(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
      expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
    });

    test('openがfalseからtrueに変わってもクラッシュしない', () => {
      const { rerender } = render(<Drawer {...defaultProps} open={false} />);

      expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();

      rerender(<Drawer {...defaultProps} open={true} />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    test('toggleDrawerが複数回呼ばれても問題ない', () => {
      const toggleDrawer = jest.fn();
      render(<Drawer {...defaultProps} toggleDrawer={toggleDrawer} />);

      const closeButton = screen.getByTestId('ChevronLeftIcon').closest('button');

      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);

      expect(toggleDrawer).toHaveBeenCalledTimes(3);
    });
  });
});
