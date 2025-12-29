import { toLocaleDateString } from '@/src/domain/functions/date';

import { TaskListItem, GroupType, GroupKey } from '../types';

/**
 * タスクを日付またはエリアでグループ化する
 * TYPE-002: TaskListItem（history_id, assign_cycle_id含む）を使用
 *
 * @param items - グループ化するタスクの配列
 * @param groupKey - グループ化のキー ('time': 作成日でグループ化, 'area': エリアでグループ化)
 * @returns グループ化されたタスク（キー: 日付またはエリア名, 値: タスクの配列）
 */
export const grouping = (items: TaskListItem[], groupKey: GroupKey): GroupType => {
  return items.reduce((acc: GroupType, item: TaskListItem) => {
    const key = groupKey === 'time'
      ? toLocaleDateString(new Date(item.created_at))
      : item.area_name;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);

    return acc;
  }, {});
};
