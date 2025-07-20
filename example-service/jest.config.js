export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.js'],
  extensionsToTreatAsEsm: ['.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@shared|auth-middleware)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.js',
    '!src/types/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFiles: ['<rootDir>/src/tests/setup.js']
}; 