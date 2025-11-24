exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.android.spec.js'],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
      'appium:app': process.env.APPIUM_APP_ANDROID || './android/app/build/outputs/apk/debug/app-debug.apk',
      'appium:autoGrantPermissions': true,
    },
  ],
  services: [['appium', {args: {allowCors: true}}]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {ui: 'bdd', timeout: 600000},
};

