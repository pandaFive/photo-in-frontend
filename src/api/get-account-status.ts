'use server';

export interface ErrorResponse {
  message: string;
}

export type Statuses = {
  [key: string]: string | number;
};

export async function getAccountStatus(): Promise<Statuses[] | ErrorResponse> {
  const res = await fetch(`${process.env.API_HOST}/accounts`, {
    cache: 'no-store',
  });

  if (res.ok) {
    const result: Statuses[] = (await res.json()) as Statuses[];
    return result;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
