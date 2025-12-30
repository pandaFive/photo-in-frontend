import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartSkeleton from '@/src/components/ChartSkeleton';

describe('ChartSkeleton', () => {
  test('renders skeleton elements', () => {
    render(<ChartSkeleton />);

    // Skeletonコンポーネントが2つレンダリングされることを確認
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(2);
  });

  test('renders text skeleton for title', () => {
    render(<ChartSkeleton />);

    // テキストスケルトンが存在することを確認
    const textSkeleton = document.querySelector('.MuiSkeleton-text');
    expect(textSkeleton).toBeInTheDocument();
  });

  test('renders rectangular skeleton for chart area', () => {
    render(<ChartSkeleton />);

    // 矩形スケルトンが存在することを確認
    const rectSkeleton = document.querySelector('.MuiSkeleton-rectangular');
    expect(rectSkeleton).toBeInTheDocument();
  });

  test('container has full height and width', () => {
    const { container } = render(<ChartSkeleton />);

    // コンテナがheight: 100%, width: 100%を持つことを確認
    const box = container.firstChild as HTMLElement;
    expect(box).toHaveStyle({ height: '100%', width: '100%' });
  });
});
