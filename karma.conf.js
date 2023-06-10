/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = function (config) {
  config.set({
    frameworks: ['tap', 'karma-typescript'],
    plugins: ['karma-typescript', 'karma-tap', 'karma-chrome-launcher'],
    files: ['src/**/*.ts', 'test/**/*.ts'],
    preprocessors: {
      '**/*.ts': ['karma-typescript'],
    },
    karmaTypescriptConfig: {
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/,
        acornOptions: {
          ecmaVersion: 13,
        },
        transforms: [require('karma-typescript-es6-transform')()],
      },
      tsconfig: './tsconfig.json',
    },
    colors: true,
    reporters: ['progress', 'karma-typescript'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: 1,
    // Fail after timeout
    browserDisconnectTimeout: 100000,
    browserNoActivityTimeout: 100000,
  });
};
