type Task = {
  id: number;
  title: string;
  area_name: string;
  history_id: number;
  created_at: string;
};

export const getMemberAssignTask = async (id: string) => {
  try {
    const res = await fetch(`/api/account/${id}/tasks`, {
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
