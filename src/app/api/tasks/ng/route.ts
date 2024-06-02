'use server';

import { NextResponse } from 'next/server';

type AdminTask = {
  id: number;
  title: string;
  area_name: string;
  cycle_id: number;
  created_at: string;
};

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks?type=ng`, {
      method: 'GET',
      cache: 'no-store',
    });

    const result: AdminTask[] = (await res.json()) as AdminTask[];
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(Array<AdminTask>);
  }
};
