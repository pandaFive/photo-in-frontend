'use client';
import { formatDateToEnglish } from '@/src/domain/functions/date';
import { getNow } from '@/src/infra/time';

/**
 * @deprecated 代わりに domain/functions/date の formatDateToEnglish と infra/time の getNow を使用してください
 */
export default function getCurrentTime(): string {
  return formatDateToEnglish(getNow());
}
