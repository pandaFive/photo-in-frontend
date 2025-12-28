import { grouping } from '@/src/util/grouping';
import { Task } from '@/src/types';

// toLocaleDateStringをモック（ロケールに依存しないテストのため）
jest.mock('@/src/domain/functions/date', () => ({
  toLocaleDateString: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },
}));

describe('grouping', () => {
  // テスト用タスクのヘルパー関数
  const createTask = (
    id: number,
    area_name: string,
    created_at: string,
    task_title = `タスク${id}`
  ): Task => ({
    id,
    task_title,
    area_name,
    history_id: id * 10,
    assign_cycle_id: 1,
    created_at,
  });

  describe('時間でグループ化（groupKey: "time"）', () => {
    test('同じ日付のタスクが同じグループに入る', () => {
      // 同じ日付（UTC）のタスク
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-15T00:00:00Z'),
        createTask(3, '名古屋', '2024-01-15T00:00:00Z'),
      ];

      const result = grouping(tasks, 'time');

      // 同じ日付のタスクは同じグループに入る
      const keys = Object.keys(result);
      expect(keys).toHaveLength(1);
      expect(result[keys[0]]).toHaveLength(3);
    });

    test('異なる日付のタスクが別のグループに分かれる', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-16T00:00:00Z'),
        createTask(3, '名古屋', '2024-01-17T00:00:00Z'),
      ];

      const result = grouping(tasks, 'time');

      expect(Object.keys(result)).toHaveLength(3);
    });

    test('複数日付で複数タスクが正しくグループ化される', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-15T00:00:00Z'),
        createTask(3, '名古屋', '2024-01-16T00:00:00Z'),
        createTask(4, '福岡', '2024-01-16T00:00:00Z'),
        createTask(5, '札幌', '2024-01-16T00:00:00Z'),
      ];

      const result = grouping(tasks, 'time');

      expect(Object.keys(result)).toHaveLength(2);
      // 1/15には2つ、1/16には3つ
      const counts = Object.values(result).map((arr) => arr.length);
      expect(counts.sort()).toEqual([2, 3]);
    });

    test('グループ内のタスク順序が保持される', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-15T00:00:00Z'),
        createTask(3, '名古屋', '2024-01-15T00:00:00Z'),
      ];

      const result = grouping(tasks, 'time');
      const groupedTasks = Object.values(result)[0];

      expect(groupedTasks[0].id).toBe(1);
      expect(groupedTasks[1].id).toBe(2);
      expect(groupedTasks[2].id).toBe(3);
    });
  });

  describe('エリアでグループ化（groupKey: "area"）', () => {
    test('同じエリアのタスクが同じグループに入る', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '東京', '2024-01-16T00:00:00Z'),
        createTask(3, '東京', '2024-01-17T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(Object.keys(result)).toEqual(['東京']);
      expect(result['東京']).toHaveLength(3);
    });

    test('異なるエリアのタスクが別のグループに分かれる', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-15T00:00:00Z'),
        createTask(3, '名古屋', '2024-01-15T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(Object.keys(result).sort()).toEqual(['名古屋', '大阪', '東京']);
      expect(result['東京']).toHaveLength(1);
      expect(result['大阪']).toHaveLength(1);
      expect(result['名古屋']).toHaveLength(1);
    });

    test('複数エリアで複数タスクが正しくグループ化される', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '東京', '2024-01-16T00:00:00Z'),
        createTask(3, '大阪', '2024-01-15T00:00:00Z'),
        createTask(4, '名古屋', '2024-01-15T00:00:00Z'),
        createTask(5, '名古屋', '2024-01-16T00:00:00Z'),
        createTask(6, '名古屋', '2024-01-17T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(result['東京']).toHaveLength(2);
      expect(result['大阪']).toHaveLength(1);
      expect(result['名古屋']).toHaveLength(3);
    });

    test('グループ内のタスク順序が保持される', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '東京', '2024-01-16T00:00:00Z'),
        createTask(3, '東京', '2024-01-17T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(result['東京'][0].id).toBe(1);
      expect(result['東京'][1].id).toBe(2);
      expect(result['東京'][2].id).toBe(3);
    });
  });

  describe('エッジケース', () => {
    test('空配列の場合、空のオブジェクトを返す（time）', () => {
      const result = grouping([], 'time');

      expect(result).toEqual({});
    });

    test('空配列の場合、空のオブジェクトを返す（area）', () => {
      const result = grouping([], 'area');

      expect(result).toEqual({});
    });

    test('1つのタスクのみの場合、1グループに1要素（time）', () => {
      const tasks: Task[] = [createTask(1, '東京', '2024-01-15T00:00:00Z')];

      const result = grouping(tasks, 'time');

      expect(Object.keys(result)).toHaveLength(1);
      expect(Object.values(result)[0]).toHaveLength(1);
    });

    test('1つのタスクのみの場合、1グループに1要素（area）', () => {
      const tasks: Task[] = [createTask(1, '東京', '2024-01-15T00:00:00Z')];

      const result = grouping(tasks, 'area');

      expect(result['東京']).toHaveLength(1);
    });

    test('エリア名に特殊文字を含む場合も正しくグループ化される', () => {
      const tasks: Task[] = [
        createTask(1, '東京都/渋谷区', '2024-01-15T00:00:00Z'),
        createTask(2, '東京都/渋谷区', '2024-01-16T00:00:00Z'),
        createTask(3, '神奈川県&横浜市', '2024-01-15T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(result['東京都/渋谷区']).toHaveLength(2);
      expect(result['神奈川県&横浜市']).toHaveLength(1);
    });

    test('空文字のエリア名でもグループ化される', () => {
      const tasks: Task[] = [
        createTask(1, '', '2024-01-15T00:00:00Z'),
        createTask(2, '', '2024-01-16T00:00:00Z'),
      ];

      const result = grouping(tasks, 'area');

      expect(result['']).toHaveLength(2);
    });
  });

  describe('タスクデータの整合性', () => {
    test('グループ化後もタスクの全プロパティが保持される', () => {
      const originalTask: Task = {
        id: 42,
        task_title: '重要なタスク',
        area_name: '東京',
        history_id: 100,
        assign_cycle_id: 5,
        created_at: '2024-01-15T10:30:00Z',
      };

      const result = grouping([originalTask], 'area');
      const groupedTask = result['東京'][0];

      expect(groupedTask).toEqual(originalTask);
      expect(groupedTask.id).toBe(42);
      expect(groupedTask.task_title).toBe('重要なタスク');
      expect(groupedTask.area_name).toBe('東京');
      expect(groupedTask.history_id).toBe(100);
      expect(groupedTask.assign_cycle_id).toBe(5);
      expect(groupedTask.created_at).toBe('2024-01-15T10:30:00Z');
    });

    test('元の配列は変更されない', () => {
      const tasks: Task[] = [
        createTask(1, '東京', '2024-01-15T00:00:00Z'),
        createTask(2, '大阪', '2024-01-16T00:00:00Z'),
      ];
      const originalLength = tasks.length;

      grouping(tasks, 'area');

      expect(tasks).toHaveLength(originalLength);
    });
  });
});
