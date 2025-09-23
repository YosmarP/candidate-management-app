module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/?(*.)+(spec).ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|m?js|html|js)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts','js','html','json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$'
    }
  }
};