interface ErrorResponse {
  message: string;
}

interface Completed {
  [key: string]: number;
}

export async function getWeekComplete(): Promise<Completed | ErrorResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/completed-data`,
    {
      cache: 'no-store',
    },
  );

  if (res.ok) {
    const result: Completed = (await res.json()) as Completed;
    return result;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
