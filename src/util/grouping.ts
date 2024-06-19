type Task = {
  id: number;
  title: string;
  area_name: string;
  created_at: string;
};

type MemberTask = Task & {
  history_id: number;
};

type AdminTask = Task & {
  cycle_id: number;
};

type GroupType = {
  [key: string]: (MemberTask | AdminTask)[];
};

export const grouping = (items: (MemberTask | AdminTask)[], key: string) => {
  if (key === 'time') {
    return items.reduce((acc: GroupType, item: MemberTask | AdminTask) => {
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
    return items.reduce((acc: GroupType, item: MemberTask | AdminTask) => {
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
