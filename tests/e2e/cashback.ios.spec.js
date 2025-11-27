const {$, driver} = require('@wdio/globals');
const allure = require('@wdio/allure-reporter').default;
const pkg = require('../../package.json');

describe('Cashback iOS - navegación y redención', () => {
  before(() => {
    allure.addFeature('Cashback');
    allure.addStory('Navegación y Redención');
    allure.addSeverity('normal');
    allure.addEnvironment('platform', 'iOS');
    allure.addEnvironment('appVersion', pkg.version);
    allure.addEnvironment('reactNative', pkg.dependencies['react-native']);
    allure.addDescription(
      'E2E de navegación al screen de Cashback, retorno con back, y redención según umbral.',
    );
  });
  beforeEach(async () => {
    await driver.activateApp('org.reactjs.native.example.TerpelPoC');
  });

  it('navega a Cashback y regresa con back', async () => {
    const open = await $('~open-cashback');
    await open.waitForExist({timeout: 15000});
    await open.click();

    const back = await $('~cashback-back');
    await back.waitForExist({timeout: 8000});
    await back.click();

    const homeBtn = await $('~open-mi-bolsillo');
    await homeBtn.waitForExist({timeout: 8000});
  });

  it('redime a puntos cuando es menor al umbral', async () => {
    const open = await $('~open-cashback');
    await open.waitForExist({timeout: 15000});
    await open.click();

    const input = await $('//*[@value="$ 0" or @label="$ 0" or @name="$ 0"]');
    await input.waitForExist({timeout: 8000});
    await input.setValue('19000');
    const redeem = await $('~Redimir ahora');
    await redeem.click();
    await $('~Convertido a puntos').waitForExist({timeout: 8000});
  });

  it('redime al bolsillo cuando supera umbral', async () => {
    const input = await $('//*[@value="$ 0" or @label="$ 0" or @name="$ 0"]');
    await input.waitForExist({timeout: 8000});
    await input.setValue('22000');
    const redeem = await $('~Redimir ahora');
    await redeem.click();
    await $('~Redimido al bolsillo').waitForExist({timeout: 8000});
  });
});
