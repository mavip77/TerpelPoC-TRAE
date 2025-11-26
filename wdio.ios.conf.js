const caps = require('./capabilities.json');
const fs = require('fs');
const path = require('path');

exports.config = {
  runner: 'local',
  specs: ['./tests/e2e/**/*.ios.spec.js'],
  maxInstances: 1,
  capabilities: [
    Object.assign({}, caps.ios, {
      'appium:deviceName':
        process.env.IOS_DEVICE_NAME || caps.ios['appium:deviceName'],
      'appium:platformVersion':
        process.env.IOS_PLATFORM_VERSION || caps.ios['appium:platformVersion'],
      'appium:app': process.env.APPIUM_APP_IOS || caps.ios['appium:app'],
      'appium:udid': process.env.IOS_UDID || caps.ios['appium:udid'],
    }),
  ],
  services: [['appium', {args: {allowCors: true}}]],
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: './reports/allure/ios',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],
  mochaOpts: {ui: 'bdd', timeout: 600000},
  beforeTest: async function () {
    try {
      await driver.startRecordingScreen({
        timeLimit: '180s',
      });
    } catch {}
  },
  afterTest: async function (test, context, {passed}) {
    try {
      const name = `${Date.now()}_${test.title.replace(/\s+/g, '_')}_${passed ? 'passed' : 'failed'}.png`;
      const file = `./reports/screenshots/ios/${name}`;
      fs.mkdirSync('./reports/screenshots/ios', {recursive: true});
      await browser.saveScreenshot(file);
      try {
        const allure = require('@wdio/allure-reporter').default;
        const buf = fs.readFileSync(file);
        allure.addAttachment('screenshot', buf, 'image/png');
      } catch {}
    } catch {}
    try {
      const b64 = await driver.stopRecordingScreen();
      if (b64) {
        const dir = path.join('reports', 'videos', 'ios');
        fs.mkdirSync(dir, {recursive: true});
        const file = path.join(
          dir,
          `${Date.now()}_${test.title.replace(/\s+/g, '_')}.mp4`,
        );
        fs.writeFileSync(file, Buffer.from(b64, 'base64'));
        try {
          const allure = require('@wdio/allure-reporter').default;
          const buf = fs.readFileSync(file);
          allure.addAttachment('video', buf, 'video/mp4');
        } catch {}
      }
    } catch {}
  },
};
