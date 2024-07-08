'use server';

import { NextResponse } from 'next/server';

import { Area } from '@/src/types';

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/areas`, {
      method: 'GET',
    });
    if (res.ok) {
      const result: Area[] = (await res.json()) as Area[];
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
