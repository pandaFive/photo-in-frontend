// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.+)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // MUI X パッケージはESMを使用しているためトランスパイル対象に含める
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui/x-charts|@mui/x-data-grid|d3-.*|internmap)/)',
  ],
};

module.exports = createJestConfig(customJestConfig);
