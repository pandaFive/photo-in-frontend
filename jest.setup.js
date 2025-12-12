import '@testing-library/jest-dom';

// MUI X Charts等で使用されるResizeObserverのモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// MUI X Chartsで使用されるgetBoundingClientRectのモック
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 500,
  height: 300,
  top: 0,
  left: 0,
  bottom: 300,
  right: 500,
  x: 0,
  y: 0,
  toJSON: () => {},
}));
