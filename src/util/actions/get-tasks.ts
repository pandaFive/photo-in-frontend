type Task = {
  id: number;
  title: string;
  area_name: string;
  cycle_id: number;
  created_at: string;
};

export const getAllTasks = async () => {
  try {
    const res = await fetch(`/api/tasks?type=all`, {
      method: 'GET',
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error(err);
    return Array<Task>;
  }
};

export const getNGTasks = async () => {
  try {
    const res = await fetch(`/api/tasks/ng`, {
      method: 'GET',
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error(err);
    return new Array([]);
  }
};
