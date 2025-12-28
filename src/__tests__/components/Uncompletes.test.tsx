import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Uncompletes from '@/src/components/Uncompletes';

describe('Uncompletes', () => {
  describe('レンダリング', () => {
    test('タイトル「非達成件数」が表示される', () => {
      render(<Uncompletes count={0} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('非達成件数')).toBeInTheDocument();
    });

    test('現在時刻が「on」付きで表示される', () => {
      render(<Uncompletes count={0} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('on 2024-01-01 12:00')).toBeInTheDocument();
    });

    test('View moreリンクが表示される', () => {
      render(<Uncompletes count={0} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('View more')).toBeInTheDocument();
    });

    test('View moreリンクのhrefは/task', () => {
      render(<Uncompletes count={0} currentTime="2024-01-01 12:00" />);

      const viewMoreLink = screen.getByText('View more');
      expect(viewMoreLink).toHaveAttribute('href', '/task');
    });
  });

  describe('正常表示（error=false）', () => {
    test('件数が「件」付きで表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('10件')).toBeInTheDocument();
    });

    test('件数0が表示される', () => {
      render(<Uncompletes count={0} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('0件')).toBeInTheDocument();
    });

    test('件数1が表示される', () => {
      render(<Uncompletes count={1} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('1件')).toBeInTheDocument();
    });

    test('大きな件数が表示される', () => {
      render(<Uncompletes count={9999} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('9999件')).toBeInTheDocument();
    });

    test('エラーアラートは表示されない', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('再読み込みボタンは表示されない', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      expect(screen.queryByText('再読み込み')).not.toBeInTheDocument();
    });
  });

  describe('エラー表示（error=true）', () => {
    test('エラーアラートが表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByText('非達成件数の取得に失敗しました。')).toBeInTheDocument();
    });

    test('件数は表示されない', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.queryByText('10件')).not.toBeInTheDocument();
    });

    test('再読み込みボタンが表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByRole('link', { name: /再読み込み/ })).toBeInTheDocument();
    });

    test('再読み込みボタンのhrefは/dashboard', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      const refreshButton = screen.getByRole('link', { name: /再読み込み/ });
      expect(refreshButton).toHaveAttribute('href', '/dashboard');
    });

    test('RefreshIconが表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByTestId('RefreshIcon')).toBeInTheDocument();
    });

    test('エラー時もタイトルは表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByText('非達成件数')).toBeInTheDocument();
    });

    test('エラー時も現在時刻は表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByText('on 2024-01-01 12:00')).toBeInTheDocument();
    });

    test('エラー時もView moreリンクは表示される', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.getByText('View more')).toBeInTheDocument();
    });

    test('アラートはerror severity', () => {
      const { container } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />
      );

      expect(container.querySelector('.MuiAlert-standardError')).toBeInTheDocument();
    });
  });

  describe('デフォルト値', () => {
    test('errorのデフォルト値はfalse', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('10件')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('MUIスタイル', () => {
    test('タイトルはh5バリアント', () => {
      const { container } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" />
      );

      expect(container.querySelector('.MuiTypography-h5')).toBeInTheDocument();
    });

    test('件数はh4バリアント', () => {
      const { container } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" />
      );

      expect(container.querySelector('.MuiTypography-h4')).toBeInTheDocument();
    });

    test('現在時刻のTypographyが存在する', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      const timeText = screen.getByText('on 2024-01-01 12:00');
      expect(timeText).toHaveClass('MuiTypography-root');
    });

    test('View moreリンクはprimaryカラー', () => {
      render(<Uncompletes count={10} currentTime="2024-01-01 12:00" />);

      const viewMoreLink = screen.getByText('View more');
      expect(viewMoreLink).toHaveClass('MuiLink-root');
    });
  });

  describe('エッジケース', () => {
    test('様々な時刻フォーマットが表示される', () => {
      render(<Uncompletes count={0} currentTime="12月28日 15:30" />);

      expect(screen.getByText('on 12月28日 15:30')).toBeInTheDocument();
    });

    test('空の時刻文字列でも表示される', () => {
      render(<Uncompletes count={0} currentTime="" />);

      expect(screen.getByText('on')).toBeInTheDocument();
    });

    test('非常に大きな件数も表示される', () => {
      render(<Uncompletes count={1000000} currentTime="2024-01-01 12:00" />);

      expect(screen.getByText('1000000件')).toBeInTheDocument();
    });

    test('長い時刻文字列も表示される', () => {
      render(<Uncompletes count={0} currentTime="2024年12月28日（土）15時30分00秒" />);

      expect(screen.getByText('on 2024年12月28日（土）15時30分00秒')).toBeInTheDocument();
    });
  });

  describe('状態切替', () => {
    test('errorがfalseからtrueに変わると表示が切り替わる', () => {
      const { rerender } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" error={false} />
      );

      expect(screen.getByText('10件')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      rerender(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />);

      expect(screen.queryByText('10件')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('errorがtrueからfalseに変わると表示が切り替わる', () => {
      const { rerender } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" error={true} />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<Uncompletes count={10} currentTime="2024-01-01 12:00" error={false} />);

      expect(screen.getByText('10件')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('countが更新されると表示も更新される', () => {
      const { rerender } = render(
        <Uncompletes count={5} currentTime="2024-01-01 12:00" />
      );

      expect(screen.getByText('5件')).toBeInTheDocument();

      rerender(<Uncompletes count={15} currentTime="2024-01-01 12:00" />);

      expect(screen.queryByText('5件')).not.toBeInTheDocument();
      expect(screen.getByText('15件')).toBeInTheDocument();
    });

    test('currentTimeが更新されると表示も更新される', () => {
      const { rerender } = render(
        <Uncompletes count={10} currentTime="2024-01-01 12:00" />
      );

      expect(screen.getByText('on 2024-01-01 12:00')).toBeInTheDocument();

      rerender(<Uncompletes count={10} currentTime="2024-01-01 18:00" />);

      expect(screen.queryByText('on 2024-01-01 12:00')).not.toBeInTheDocument();
      expect(screen.getByText('on 2024-01-01 18:00')).toBeInTheDocument();
    });
  });
});
