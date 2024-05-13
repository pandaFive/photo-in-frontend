export interface Task {
  [key: string]: string;
}

const postTaskCreate = async (name: string) => {
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: { task_title: name },
      }),
    });
    const result: Task = (await res.json()) as Task;
    return result;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export default postTaskCreate;
