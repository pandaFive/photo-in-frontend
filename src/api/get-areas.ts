'use server';

import { Area } from '../types';

export const getAreas = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/areas`, {
      method: 'GET',
    });
    if (res.ok) {
      const result: Area[] = (await res.json()) as Area[];
      return result;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};
