// config used for wallabyjs

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: './jest-preset.js',
    projects: [
        "./lambdas/*"
    ]
}
