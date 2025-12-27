import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import Orders from '@/src/components/Orders';
import { MemberStatus } from '@/src/types';

// テスト用モックデータ
const createMockMember = (overrides: Partial<MemberStatus> = {}): MemberStatus => ({
  id: 1,
  capacity: 10,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  name: 'テストユーザー',
  area: ['東京', '神奈川'],
  total: 50,
  week: 10,
  ng_rate: 5,
  assign: 3,
  ...overrides,
});

describe('Orders', () => {
  describe('正常表示（error=false）', () => {
    test('タイトル「Recent Orders」が表示される', () => {
      render(<Orders members={[]} />);

      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });

    test('テーブルヘッダーが表示される', () => {
      render(<Orders members={[]} />);

      expect(screen.getByRole('columnheader', { name: '名前' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'エリア' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '総計' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '週間総計' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'NG率' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '現在アサイン' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '遂行総計' })).toBeInTheDocument();
    });

    test('メンバーデータがテーブル行に表示される', () => {
      const member = createMockMember();
      render(<Orders members={[member]} />);

      const rows = screen.getAllByRole('row');
      // ヘッダー行 + データ行1件
      expect(rows).toHaveLength(2);

      const dataRow = rows[1];
      expect(within(dataRow).getByText('テストユーザー')).toBeInTheDocument();
      expect(within(dataRow).getByText('東京 神奈川')).toBeInTheDocument();
      expect(within(dataRow).getByText('50')).toBeInTheDocument();
      expect(within(dataRow).getByText('10')).toBeInTheDocument();
      expect(within(dataRow).getByText('5')).toBeInTheDocument();
      expect(within(dataRow).getByText('3')).toBeInTheDocument();
      expect(within(dataRow).getByText('50件')).toBeInTheDocument();
    });

    test('複数メンバーが表示される', () => {
      const members = [
        createMockMember({ id: 1, name: 'ユーザー1' }),
        createMockMember({ id: 2, name: 'ユーザー2' }),
        createMockMember({ id: 3, name: 'ユーザー3' }),
      ];
      render(<Orders members={members} />);

      const rows = screen.getAllByRole('row');
      // ヘッダー行 + データ行3件
      expect(rows).toHaveLength(4);

      expect(screen.getByText('ユーザー1')).toBeInTheDocument();
      expect(screen.getByText('ユーザー2')).toBeInTheDocument();
      expect(screen.getByText('ユーザー3')).toBeInTheDocument();
    });

    test('エリアがスペース区切りで表示される', () => {
      const member = createMockMember({
        area: ['東京', '神奈川', '千葉', '埼玉'],
      });
      render(<Orders members={[member]} />);

      expect(screen.getByText('東京 神奈川 千葉 埼玉')).toBeInTheDocument();
    });

    test('遂行総計に「件」が付く', () => {
      const member = createMockMember({ total: 123 });
      render(<Orders members={[member]} />);

      expect(screen.getByText('123件')).toBeInTheDocument();
    });
  });

  describe('エラー表示（error=true）', () => {
    test('エラーアラートが表示される', () => {
      render(<Orders members={[]} error={true} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<Orders members={[]} error={true} />);

      expect(screen.getByText('メンバー情報の取得に失敗しました。')).toBeInTheDocument();
    });

    test('テーブルは表示されない', () => {
      render(<Orders members={[]} error={true} />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('再読み込みボタンが表示される', () => {
      render(<Orders members={[]} error={true} />);

      expect(screen.getByRole('link', { name: /再読み込み/ })).toBeInTheDocument();
    });

    test('再読み込みボタンのリンク先が/dashboardになっている', () => {
      render(<Orders members={[]} error={true} />);

      const refreshButton = screen.getByRole('link', { name: /再読み込み/ });
      expect(refreshButton).toHaveAttribute('href', '/dashboard');
    });

    test('タイトルはエラー時も表示される', () => {
      render(<Orders members={[]} error={true} />);

      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('空のメンバー配列でもテーブルは表示される', () => {
      render(<Orders members={[]} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      // ヘッダー行のみ
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(1);
    });

    test('エリアが空配列のメンバーでも表示できる', () => {
      const member = createMockMember({ area: [] });
      render(<Orders members={[member]} />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2);
    });

    test('エリアが1つだけのメンバー', () => {
      const member = createMockMember({ area: ['大阪'] });
      render(<Orders members={[member]} />);

      expect(screen.getByText('大阪')).toBeInTheDocument();
    });

    test('数値が0のメンバーデータ', () => {
      const member = createMockMember({
        total: 0,
        week: 0,
        ng_rate: 0,
        assign: 0,
      });
      render(<Orders members={[member]} />);

      // 0件と表示される
      expect(screen.getByText('0件')).toBeInTheDocument();
    });

    test('大きな数値のメンバーデータ', () => {
      const member = createMockMember({
        total: 99999,
        week: 1000,
        ng_rate: 100,
        assign: 500,
      });
      render(<Orders members={[member]} />);

      expect(screen.getByText('99999件')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    test('特殊文字を含む名前', () => {
      const member = createMockMember({ name: 'テスト<script>alert("xss")</script>' });
      render(<Orders members={[member]} />);

      // React自動エスケープにより安全に表示される
      expect(screen.getByText('テスト<script>alert("xss")</script>')).toBeInTheDocument();
    });

    test('日本語のエリア名が正しく表示される', () => {
      const member = createMockMember({
        area: ['北海道', '青森県', '岩手県'],
      });
      render(<Orders members={[member]} />);

      expect(screen.getByText('北海道 青森県 岩手県')).toBeInTheDocument();
    });
  });

  describe('デフォルト値', () => {
    test('errorプロパティのデフォルトはfalse', () => {
      render(<Orders members={[]} />);

      // テーブルが表示される（エラーではない）
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('テーブル構造', () => {
    test('テーブルにはTheadとTbodyがある', () => {
      const member = createMockMember();
      render(<Orders members={[member]} />);

      const table = screen.getByRole('table');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
    });

    test('ヘッダー行は7列', () => {
      render(<Orders members={[]} />);

      const headerCells = screen.getAllByRole('columnheader');
      expect(headerCells).toHaveLength(7);
    });

    test('データ行も7列', () => {
      const member = createMockMember();
      render(<Orders members={[member]} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      const cells = within(dataRow).getAllByRole('cell');
      expect(cells).toHaveLength(7);
    });

    test('遂行総計のセルは右寄せ', () => {
      const member = createMockMember();
      render(<Orders members={[member]} />);

      // ヘッダーの遂行総計セル（MUIはtext-alignスタイルで右寄せを適用）
      const headerCell = screen.getByRole('columnheader', { name: '遂行総計' });
      expect(headerCell).toHaveStyle({ textAlign: 'right' });

      // データ行の最後のセル（遂行総計）
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      const cells = within(dataRow).getAllByRole('cell');
      const lastCell = cells[cells.length - 1];
      expect(lastCell).toHaveStyle({ textAlign: 'right' });
    });
  });
});
