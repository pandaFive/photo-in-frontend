'use server';

interface ErrorResponse {
  message: string;
}

export async function getUnfulfilledCount(): Promise<number | ErrorResponse> {
  const res = await fetch(`${process.env.API_HOST}/unfulfilled-count`, {
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (res.ok) {
    const unfulfilledCount: number = (await res.json()) as number;
    return unfulfilledCount;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
