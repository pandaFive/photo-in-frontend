import { renderHook } from '@testing-library/react';
import { useWeekComplete } from '@/src/queries/useWeekComplete';

// SWRのモック関数を外部で定義
const mockUseSWR = jest.fn();

// SWRをモック
jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

// getWeekCompleteをモック
jest.mock('@/src/api/get-week-complete', () => ({
  getWeekComplete: jest.fn(),
}));

// 日付関数をモック
jest.mock('@/src/domain/functions/date', () => ({
  getDatesForPastWeek: jest.fn(() => [
    '2024/01/01',
    '2024/01/02',
    '2024/01/03',
    '2024/01/04',
    '2024/01/05',
    '2024/01/06',
    '2024/01/07',
  ]),
}));

jest.mock('@/src/infra/time', () => ({
  getNow: jest.fn(() => new Date('2024-01-07')),
}));

describe('useWeekComplete', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('data transformation', () => {
    test('transforms raw data to chart data format', () => {
      const rawData = {
        '2024/01/01': 5,
        '2024/01/02': 3,
        '2024/01/03': 8,
        '2024/01/04': 2,
        '2024/01/05': 0,
        '2024/01/06': 4,
        '2024/01/07': 6,
      };

      mockUseSWR.mockReturnValue({
        data: rawData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.data).toEqual([
        { date: '2024/01/01', amount: 5 },
        { date: '2024/01/02', amount: 3 },
        { date: '2024/01/03', amount: 8 },
        { date: '2024/01/04', amount: 2 },
        { date: '2024/01/05', amount: 0 },
        { date: '2024/01/06', amount: 4 },
        { date: '2024/01/07', amount: 6 },
      ]);
    });

    test('uses 0 for missing dates in raw data', () => {
      const rawData = {
        '2024/01/01': 5,
        '2024/01/03': 3,
        // Missing other dates
      };

      mockUseSWR.mockReturnValue({
        data: rawData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.data[1].amount).toBe(0); // 2024/01/02 missing
      expect(result.current.data[3].amount).toBe(0); // 2024/01/04 missing
    });

    test('returns empty array when no data', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.data).toEqual([]);
    });
  });

  describe('max calculation', () => {
    test('calculates max with padding (max + 5)', () => {
      const rawData = {
        '2024/01/01': 5,
        '2024/01/02': 10, // max value
        '2024/01/03': 3,
        '2024/01/04': 2,
        '2024/01/05': 0,
        '2024/01/06': 4,
        '2024/01/07': 6,
      };

      mockUseSWR.mockReturnValue({
        data: rawData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.max).toBe(15); // 10 + 5 padding
    });

    test('returns default max (10) when no data', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.max).toBe(10);
    });

    test('returns default max (10) when all values are 0', () => {
      const rawData = {
        '2024/01/01': 0,
        '2024/01/02': 0,
        '2024/01/03': 0,
        '2024/01/04': 0,
        '2024/01/05': 0,
        '2024/01/06': 0,
        '2024/01/07': 0,
      };

      mockUseSWR.mockReturnValue({
        data: rawData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.max).toBe(10);
    });
  });

  describe('loading state', () => {
    test('returns isLoading from SWR', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.isLoading).toBe(true);
    });

    test('returns false when not loading', () => {
      mockUseSWR.mockReturnValue({
        data: {},
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    test('returns error message when error occurs', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('Fetch failed'),
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.error).toBe('データの取得に失敗しました');
    });

    test('returns null when no error', () => {
      mockUseSWR.mockReturnValue({
        data: {},
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() => useWeekComplete());

      expect(result.current.error).toBeNull();
    });
  });

  describe('SWR configuration', () => {
    test('calls useSWR with correct key and options', () => {
      mockUseSWR.mockReturnValue({
        data: {},
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      renderHook(() => useWeekComplete());

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/week-complete',
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 300000,
        })
      );
    });
  });

  test('returns all expected properties', () => {
    mockUseSWR.mockReturnValue({
      data: {},
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    } as ReturnType<typeof useSWR>);

    const { result } = renderHook(() => useWeekComplete());

    expect(result.current.data).toBeDefined();
    expect(result.current.max).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });
});
