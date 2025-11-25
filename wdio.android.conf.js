const caps = require('./capabilities.json');

exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.android.spec.js'],
  maxInstances: 1,
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_BASE_PATH || '/',
  capabilities: [
    Object.assign({}, caps.android, {
      'appium:deviceName':
        process.env.ANDROID_DEVICE_NAME || caps.android['appium:deviceName'],
      'appium:app':
        process.env.APPIUM_APP_ANDROID || caps.android['appium:app'],
      'appium:udid': process.env.ANDROID_UDID || caps.android['appium:udid'],
    }),
  ],
  services: [],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {ui: 'bdd', timeout: 600000},
  afterTest: async function (test, context, {error, result, duration, passed}) {
    if (!passed) {
      const name = `${Date.now()}_${test.title.replace(/\s+/g, '_')}.png`;
      await browser.saveScreenshot(`./reports/screenshots/android/${name}`);
    }
  },
};
