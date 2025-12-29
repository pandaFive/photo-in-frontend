import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import NotFound from '@/src/app/not-found';

describe('NotFound', () => {
  describe('レンダリング', () => {
    test('404テキストが表示される', () => {
      render(<NotFound />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404');
    });

    test('エラーメッセージが表示される', () => {
      render(<NotFound />);
      expect(screen.getByText('お探しのページが見つかりませんでした')).toBeInTheDocument();
    });

    test('ホームに戻るボタンが表示される', () => {
      render(<NotFound />);
      expect(screen.getByRole('link', { name: 'ホームに戻る' })).toBeInTheDocument();
    });
  });

  describe('リンク', () => {
    test('ホームに戻るボタンのhrefが/', () => {
      render(<NotFound />);
      const homeLink = screen.getByRole('link', { name: 'ホームに戻る' });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
