export async function postLogin(name: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/user/login`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account: { name: name, password: password },
    }),
  });
  if (res.ok) {
    const account = await res.json();
    return account;
  } else {
    const errors = await res.json();
    return errors;
  }
}
