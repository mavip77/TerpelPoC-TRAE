const caps = require('./capabilities.json');
const fs = require('fs');
const path = require('path');

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
  reporters: [
    'spec',
    ['allure', {outputDir: './reports/allure/android', disableWebdriverStepsReporting: true, disableWebdriverScreenshotsReporting: false}],
  ],
  mochaOpts: {ui: 'bdd', timeout: 600000},
  beforeTest: async function () {
    try {
      await driver.startRecordingScreen({
        videoSize: '720x1280',
        timeLimit: '180s',
        bitRate: 2000000,
      });
    } catch {}
  },
  afterTest: async function (test, context, {error, result, duration, passed}) {
    if (!passed) {
      const name = `${Date.now()}_${test.title.replace(/\s+/g, '_')}.png`;
      const file = `./reports/screenshots/android/${name}`;
      await browser.saveScreenshot(file);
      try {
        const allure = require('@wdio/allure-reporter').default;
        const buf = fs.readFileSync(file);
        allure.addAttachment('screenshot', buf, 'image/png');
      } catch {}
    }
    try {
      const b64 = await driver.stopRecordingScreen();
      if (b64) {
        const dir = path.join('reports', 'videos', 'android');
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
