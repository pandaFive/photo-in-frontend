const postTaskCreate = async (name: string) => {
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

  if (res.ok) {
    const result = await res.json();
    return result;
  } else {
    return {};
  }
};

export default postTaskCreate;
