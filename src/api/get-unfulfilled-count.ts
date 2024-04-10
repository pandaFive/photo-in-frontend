interface ErrorResponse {
  message: string;
}

export async function getUnfulfilledCount(): Promise<number | ErrorResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HOST}/unfulfilled-count`,
    {
      cache: 'no-store',
    },
  );

  if (res.ok) {
    const unfulfilledCount: number = (await res.json()) as number;
    return unfulfilledCount;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
