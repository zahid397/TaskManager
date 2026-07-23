module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|@react-navigation' +
      '|react-native-screens' +
      '|react-native-safe-area-context' +
      '|react-native-url-polyfill' +
      ')/)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/tests/__mocks__/env.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@tasks/(.*)$': '<rootDir>/src/features/tasks/$1',
    '^@categories/(.*)$': '<rootDir>/src/features/categories/$1',
    '^@sync/(.*)$': '<rootDir>/src/sync/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
  ],
};
