module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/website/tests/**/*.test.ts'],
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'CommonJS', isolatedModules: true } }] },
};
