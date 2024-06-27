import { Task } from '../types';
type GroupType = {
  [key: string]: Task[];
};

export const grouping = (items: Task[], key: string) => {
  if (key === 'time') {
    return items.reduce((acc: GroupType, item: Task) => {
      const time = new Date(item['created_at']).toLocaleDateString();
      if (!acc[time]) {
        acc[time] = [];
      }
      if (acc[time] !== undefined) {
        acc[time]?.push(item);
      }
      return acc;
    }, {});
  } else if (key === 'area') {
    return items.reduce((acc: GroupType, item: Task) => {
      const area = item['area_name'];
      if (!acc[area]) {
        acc[area] = [];
      }
      if (acc[area] !== undefined) {
        acc[area]?.push(item);
      }
      return acc;
    }, {});
  } else {
    return {};
  }
};
