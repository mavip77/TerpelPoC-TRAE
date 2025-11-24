const caps = require('./capabilities.json');

exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.android.spec.js'],
  maxInstances: 1,
  capabilities: [
    Object.assign({}, caps.android, {
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || caps.android['appium:deviceName'],
      'appium:app': process.env.APPIUM_APP_ANDROID || caps.android['appium:app'],
      'appium:udid': process.env.ANDROID_UDID || caps.android['appium:udid'],
    }),
  ],
  services: [['appium', {args: {allowCors: true}}]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {ui: 'bdd', timeout: 600000},
};
