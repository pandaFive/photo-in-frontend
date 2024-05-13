export interface Task {
  id: string;
  title: string;
  area_name: string;
  created_at: string;
}

export const getAccountTasks = async (id: string) => {
  try {
    const res = await fetch(`${process.env.API_HOST}/account/tasks?id=${id}`, {
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
};
