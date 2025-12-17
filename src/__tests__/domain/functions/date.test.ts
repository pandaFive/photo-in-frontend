import {
  formatDateToYYYYMMDD,
  parseIsoToYYYYMMDD,
  getYear,
  formatDateToEnglish,
  formatDateToJapanese,
  getDatesForPastWeek,
  sortDateStrings,
  toLocaleDateString,
} from '@/src/domain/functions/date';

describe('date functions', () => {
  describe('formatDateToYYYYMMDD', () => {
    test('formats date to YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 15); // 2024-01-15
      expect(formatDateToYYYYMMDD(date)).toBe('2024-01-15');
    });

    test('pads single digit month and day with zeros', () => {
      const date = new Date(2024, 0, 5); // 2024-01-05
      expect(formatDateToYYYYMMDD(date)).toBe('2024-01-05');
    });

    test('handles December correctly', () => {
      const date = new Date(2024, 11, 31); // 2024-12-31
      expect(formatDateToYYYYMMDD(date)).toBe('2024-12-31');
    });
  });

  describe('parseIsoToYYYYMMDD', () => {
    test('parses ISO 8601 string to YYYY-MM-DD', () => {
      expect(parseIsoToYYYYMMDD('2024-01-15T00:00:00Z')).toBe('2024-01-15');
    });

    test('handles ISO string with timezone offset', () => {
      // Note: Result may vary based on local timezone
      const result = parseIsoToYYYYMMDD('2024-01-15T12:00:00+09:00');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getYear', () => {
    test('returns year from date', () => {
      const date = new Date(2024, 5, 15);
      expect(getYear(date)).toBe(2024);
    });

    test('handles year 2000', () => {
      const date = new Date(2000, 0, 1);
      expect(getYear(date)).toBe(2000);
    });
  });

  describe('formatDateToEnglish', () => {
    test('formats date to "D Month, YYYY" format', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(formatDateToEnglish(date)).toBe('15 January, 2024');
    });

    test('formats all months correctly', () => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];

      months.forEach((monthName, index) => {
        const date = new Date(2024, index, 1);
        expect(formatDateToEnglish(date)).toBe(`1 ${monthName}, 2024`);
      });
    });
  });

  describe('formatDateToJapanese', () => {
    test('formats date to "M月D日" format', () => {
      const date = new Date(2024, 0, 15); // January 15
      expect(formatDateToJapanese(date)).toBe('1月15日');
    });

    test('handles December 31st', () => {
      const date = new Date(2024, 11, 31);
      expect(formatDateToJapanese(date)).toBe('12月31日');
    });

    test('handles single digit day', () => {
      const date = new Date(2024, 5, 5);
      expect(formatDateToJapanese(date)).toBe('6月5日');
    });
  });

  describe('getDatesForPastWeek', () => {
    test('returns array of 7 dates', () => {
      const today = new Date(2024, 0, 15);
      const result = getDatesForPastWeek(today);
      expect(result).toHaveLength(7);
    });

    test('returns dates in chronological order', () => {
      const today = new Date(2024, 0, 15);
      const result = getDatesForPastWeek(today);

      // Should start from 7 days ago and end with today
      expect(result[0]).toBe('1月9日');  // 7 days before Jan 15
      expect(result[6]).toBe('1月15日'); // today
    });

    test('handles month boundary', () => {
      const today = new Date(2024, 1, 3); // Feb 3
      const result = getDatesForPastWeek(today);

      // Should include dates from January
      expect(result[0]).toBe('1月28日'); // Jan 28
      expect(result[6]).toBe('2月3日');  // Feb 3
    });

    test('handles year boundary', () => {
      const today = new Date(2024, 0, 3); // Jan 3, 2024
      const result = getDatesForPastWeek(today);

      // Should include dates from December 2023
      expect(result[0]).toBe('12月28日'); // Dec 28, 2023
      expect(result[6]).toBe('1月3日');   // Jan 3, 2024
    });
  });

  describe('sortDateStrings', () => {
    test('sorts date strings in ascending order', () => {
      const dates = ['2024-01-15', '2024-01-10', '2024-01-20'];
      const result = sortDateStrings(dates);
      expect(result).toEqual(['2024-01-10', '2024-01-15', '2024-01-20']);
    });

    test('does not mutate original array', () => {
      const dates = ['2024-01-15', '2024-01-10', '2024-01-20'];
      const original = [...dates];
      sortDateStrings(dates);
      expect(dates).toEqual(original);
    });

    test('handles empty array', () => {
      const result = sortDateStrings([]);
      expect(result).toEqual([]);
    });

    test('handles single element array', () => {
      const result = sortDateStrings(['2024-01-15']);
      expect(result).toEqual(['2024-01-15']);
    });
  });

  describe('toLocaleDateString', () => {
    test('returns locale date string', () => {
      const date = new Date(2024, 0, 15);
      const result = toLocaleDateString(date);
      // Result varies by locale, so just check it's a non-empty string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
