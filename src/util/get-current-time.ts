'use client';
export default function getCurrentTime(): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentDate = new Date();
  const monthIndex = currentDate.getMonth();
  const day = currentDate.getDate();
  const year = currentDate.getFullYear();

  return `${day} ${months[monthIndex]}, ${year}`;
}
