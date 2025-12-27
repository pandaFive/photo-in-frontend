import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import AreaChips from '@/src/components/AreaChips';

describe('AreaChips', () => {
  describe('レンダリング', () => {
    test('タイトルが表示される', () => {
      render(<AreaChips areaNames={[]} />);

      expect(screen.getByText('現在登録されているエリア：')).toBeInTheDocument();
    });

    test('Paperコンポーネントが表示される', () => {
      const { container } = render(<AreaChips areaNames={[]} />);

      expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
    });

    test('Gridコンポーネントが表示される', () => {
      const { container } = render(<AreaChips areaNames={[]} />);

      expect(container.querySelector('.MuiGrid-root')).toBeInTheDocument();
    });
  });

  describe('正常表示（error=false）', () => {
    test('エリア名がChipとして表示される', () => {
      render(<AreaChips areaNames={['東京']} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
    });

    test('複数のエリア名がChipとして表示される', () => {
      render(<AreaChips areaNames={['東京', '大阪', '福岡']} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
      expect(screen.getByText('大阪')).toBeInTheDocument();
      expect(screen.getByText('福岡')).toBeInTheDocument();
    });

    test('ChipはMuiChip-rootクラスを持つ', () => {
      const { container } = render(<AreaChips areaNames={['東京']} />);

      expect(container.querySelector('.MuiChip-root')).toBeInTheDocument();
    });

    test('Chipはoutlinedバリアント', () => {
      const { container } = render(<AreaChips areaNames={['東京']} />);

      expect(container.querySelector('.MuiChip-outlined')).toBeInTheDocument();
    });

    test('Chipはprimaryカラー', () => {
      const { container } = render(<AreaChips areaNames={['東京']} />);

      expect(container.querySelector('.MuiChip-colorPrimary')).toBeInTheDocument();
    });

    test('エラーアラートは表示されない', () => {
      render(<AreaChips areaNames={['東京']} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('空のエリア配列でもエラーにならない', () => {
      render(<AreaChips areaNames={[]} />);

      expect(screen.getByText('現在登録されているエリア：')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('空のエリア配列ではChipは表示されない', () => {
      const { container } = render(<AreaChips areaNames={[]} />);

      expect(container.querySelector('.MuiChip-root')).not.toBeInTheDocument();
    });
  });

  describe('エラー表示（error=true）', () => {
    test('エラーアラートが表示される', () => {
      render(<AreaChips areaNames={[]} error={true} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('エラーメッセージが表示される', () => {
      render(<AreaChips areaNames={[]} error={true} />);

      expect(screen.getByText('エリア情報の取得に失敗しました')).toBeInTheDocument();
    });

    test('エラー時はChipは表示されない', () => {
      const { container } = render(<AreaChips areaNames={['東京']} error={true} />);

      expect(container.querySelector('.MuiChip-root')).not.toBeInTheDocument();
    });

    test('エラー時もタイトルは表示される', () => {
      render(<AreaChips areaNames={[]} error={true} />);

      expect(screen.getByText('現在登録されているエリア：')).toBeInTheDocument();
    });

    test('アラートはerror severity', () => {
      const { container } = render(<AreaChips areaNames={[]} error={true} />);

      expect(container.querySelector('.MuiAlert-standardError')).toBeInTheDocument();
    });
  });

  describe('デフォルト値', () => {
    test('errorのデフォルト値はfalse', () => {
      render(<AreaChips areaNames={['東京']} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('東京')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('日本語のエリア名が正しく表示される', () => {
      render(<AreaChips areaNames={['北海道', '沖縄県', '東京都']} />);

      expect(screen.getByText('北海道')).toBeInTheDocument();
      expect(screen.getByText('沖縄県')).toBeInTheDocument();
      expect(screen.getByText('東京都')).toBeInTheDocument();
    });

    test('長いエリア名も表示される', () => {
      render(<AreaChips areaNames={['とても長いエリア名のテスト地域']} />);

      expect(screen.getByText('とても長いエリア名のテスト地域')).toBeInTheDocument();
    });

    test('特殊文字を含むエリア名も表示される', () => {
      render(<AreaChips areaNames={['東京（23区）', '大阪/神戸']} />);

      expect(screen.getByText('東京（23区）')).toBeInTheDocument();
      expect(screen.getByText('大阪/神戸')).toBeInTheDocument();
    });

    test('多数のエリア名も表示される', () => {
      const manyAreas = Array.from({ length: 10 }, (_, i) => `エリア${i + 1}`);
      const { container } = render(<AreaChips areaNames={manyAreas} />);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(10);
    });

    test('英語のエリア名も表示される', () => {
      render(<AreaChips areaNames={['Tokyo', 'Osaka', 'Fukuoka']} />);

      expect(screen.getByText('Tokyo')).toBeInTheDocument();
      expect(screen.getByText('Osaka')).toBeInTheDocument();
      expect(screen.getByText('Fukuoka')).toBeInTheDocument();
    });

    test('1文字のエリア名も表示される', () => {
      render(<AreaChips areaNames={['A', 'B', 'C']} />);

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('Chip数', () => {
    test('エリア名の数だけChipが表示される（1つ）', () => {
      const { container } = render(<AreaChips areaNames={['東京']} />);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(1);
    });

    test('エリア名の数だけChipが表示される（3つ）', () => {
      const { container } = render(<AreaChips areaNames={['東京', '大阪', '福岡']} />);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(3);
    });

    test('エリア名の数だけChipが表示される（5つ）', () => {
      const { container } = render(<AreaChips areaNames={['東京', '大阪', '福岡', '名古屋', '札幌']} />);

      const chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(5);
    });
  });

  describe('MUIスタイル', () => {
    test('Paperはelevation=2', () => {
      const { container } = render(<AreaChips areaNames={[]} />);

      expect(container.querySelector('.MuiPaper-elevation2')).toBeInTheDocument();
    });

    test('Typographyはh6バリアント', () => {
      const { container } = render(<AreaChips areaNames={[]} />);

      expect(container.querySelector('.MuiTypography-h6')).toBeInTheDocument();
    });
  });

  describe('状態切替', () => {
    test('errorがfalseからtrueに変わると表示が切り替わる', () => {
      const { rerender, container } = render(<AreaChips areaNames={['東京']} error={false} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      rerender(<AreaChips areaNames={['東京']} error={true} />);

      expect(screen.queryByText('東京')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('errorがtrueからfalseに変わると表示が切り替わる', () => {
      const { rerender } = render(<AreaChips areaNames={['東京']} error={true} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<AreaChips areaNames={['東京']} error={false} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('areaNames配列が更新されるとChipも更新される', () => {
      const { rerender, container } = render(<AreaChips areaNames={['東京']} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
      let chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(1);

      rerender(<AreaChips areaNames={['東京', '大阪', '福岡']} />);

      expect(screen.getByText('東京')).toBeInTheDocument();
      expect(screen.getByText('大阪')).toBeInTheDocument();
      expect(screen.getByText('福岡')).toBeInTheDocument();
      chips = container.querySelectorAll('.MuiChip-root');
      expect(chips.length).toBe(3);
    });
  });
});
