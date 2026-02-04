import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    videoCompression: false,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      coverage: false,
      codeCoverage: {
        url: '/__coverage__',
        exclude: ['cypress/**', '**/*.spec.js'],
      },
    },
    setupNodeEvents(on, config) {
      // Use plugins if needed
      return config;
    },
    experimentalStudio: false,
    experimentalWebKitSupport: false,
  },
  component: {
    devServer: {
      framework: null,
      bundler: 'webpack',
      webpackConfig: {
        mode: 'development',
        devtool: 'inline-source-map',
      },
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    watchForFileChanges: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
