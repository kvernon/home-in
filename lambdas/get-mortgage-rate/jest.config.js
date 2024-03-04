/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset : '../../jest-preset.js',
    rootDir: './',
    // The glob patterns Jest uses to detect test files
    testMatch: [
        "<rootDir>/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test).[tj]s?(x)"
    ]

}
