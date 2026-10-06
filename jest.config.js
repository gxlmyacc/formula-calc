module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      lines: 100,
      functions: 100,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { isolatedModules: true } }],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!decimal.js)/'],
};
