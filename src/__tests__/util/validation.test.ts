import { validateId } from '@/src/util/validation';

describe('validateId function', () => {
  // 無効なケース
  describe('無効なIDの場合', () => {
    it('nullの場合はエラーを返す', () => {
      const result = validateId(null);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDが不正または未指定です');
      }
    });

    it('undefinedの場合はエラーを返す', () => {
      const result = validateId(undefined);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDが不正または未指定です');
      }
    });

    it('空文字の場合はエラーを返す', () => {
      const result = validateId('');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDが不正または未指定です');
      }
    });

    it('空白のみの場合はエラーを返す', () => {
      const result = validateId('   ');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDが不正または未指定です');
      }
    });

    it('数値でない文字列の場合はエラーを返す', () => {
      const result = validateId('abc');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDは整数である必要があります');
      }
    });

    it('小数の場合はエラーを返す', () => {
      const result = validateId('1.5');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDは整数である必要があります');
      }
    });

    it('0の場合はエラーを返す', () => {
      const result = validateId('0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDは正の整数である必要があります');
      }
    });

    it('負の数の場合はエラーを返す', () => {
      const result = validateId('-1');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDは正の整数である必要があります');
      }
    });

    it('MAX_SAFE_INTEGERを超える場合はエラーを返す', () => {
      const result = validateId('9007199254740992'); // MAX_SAFE_INTEGER + 1
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('IDが範囲外です');
      }
    });
  });

  // 有効なケース
  describe('有効なIDの場合', () => {
    it('正の整数の場合は有効と判定する', () => {
      const result = validateId('1');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.id).toBe(1);
      }
    });

    it('大きな正の整数の場合も有効と判定する', () => {
      const result = validateId('12345678');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.id).toBe(12345678);
      }
    });

    it('MAX_SAFE_INTEGERの場合は有効と判定する', () => {
      const result = validateId('9007199254740991'); // MAX_SAFE_INTEGER
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.id).toBe(Number.MAX_SAFE_INTEGER);
      }
    });

    it('前後に空白がある場合もトリムして有効と判定する', () => {
      const result = validateId(' 123 ');
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.id).toBe(123);
      }
    });
  });
});
