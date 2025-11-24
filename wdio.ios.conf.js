exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.ios.spec.js'],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 16',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '18.1',
      'appium:app':
        process.env.APPIUM_APP_IOS ||
        './ios/build/Build/Products/Debug-iphonesimulator/TerpelPoC.app',
      'appium:autoAcceptAlerts': true,
    },
  ],
  services: [['appium', {args: {allowCors: true}}]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {ui: 'bdd', timeout: 600000},
};
