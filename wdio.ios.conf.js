const caps = require('./capabilities.json');

exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.ios.spec.js'],
  maxInstances: 1,
  capabilities: [
    Object.assign({}, caps.ios, {
      'appium:deviceName': process.env.IOS_DEVICE_NAME || caps.ios['appium:deviceName'],
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || caps.ios['appium:platformVersion'],
      'appium:app': process.env.APPIUM_APP_IOS || caps.ios['appium:app'],
      'appium:udid': process.env.IOS_UDID || caps.ios['appium:udid'],
    }),
  ],
  services: [['appium', {args: {allowCors: true}}]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {ui: 'bdd', timeout: 600000},
};
