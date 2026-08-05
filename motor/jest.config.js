export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/../tests'],
  testMatch: [
    '**/unit/**/*.test.js',
    '**/integration/**/*.test.js'
  ],
  collectCoverageFrom: [
    'motor/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!motor/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/../tests/setup.js'],
  testTimeout: 15000,
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};