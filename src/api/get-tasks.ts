export type Task = {
  [key: string]: string;
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${process.env.API_HOST}/tasks`, {
    cache: 'no-store',
  });

  if (res.ok) {
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } else {
    return [];
  }
}
