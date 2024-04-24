const getAccountTasks = async (id: string) => {
  const res = await fetch(`${process.env.API_HOST}/account/tasks?id=${id}`, {
    cache: 'no-store',
  });
  if (res.ok) {
    const tasks = await res.json();
    return tasks;
  } else {
    const errors = await res.json();
    return errors;
  }
};

export default getAccountTasks;
