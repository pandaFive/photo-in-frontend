type Task = {
  id: number;
  title: string;
  area_name: string;
  created_at: string;
  history_id: number;
};

type GroupType = {
  [key: string]: Task[];
};

export const grouping = (items: Task[], key: string) => {
  if (key === 'time') {
    return items.reduce((acc: GroupType, item: Task) => {
      console.log('check');
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
      console.log(acc);
      return acc;
    }, {});
  } else {
    return {};
  }
};
