const {$, driver} = require('@wdio/globals');
const allure = require('@wdio/allure-reporter').default;
const pkg = require('../../package.json');

describe('Favoritos Android - CRUD y transferir', () => {
  before(() => {
    allure.addFeature('Mi Bolsillo');
    allure.addStory('Favoritos - CRUD y Transferir');
    allure.addSeverity('critical');
    allure.addEnvironment('platform', 'Android');
    allure.addEnvironment('appVersion', pkg.version);
    allure.addEnvironment('reactNative', pkg.dependencies['react-native']);
    allure.addDescription(
      'Validación end-to-end del flujo de favoritos en Android: crear, buscar, editar, eliminar y transferir.',
    );
  });
  beforeEach(async () => {
    const pkg = 'com.terpelpoc';
    try {
      await driver.terminateApp(pkg);
    } catch {}
    await driver.activateApp(pkg);
  });

  it('crea, busca, edita, elimina y transfiere desde favorito', async () => {
    const openBolsillo = await $('~open-mi-bolsillo');
    await openBolsillo.waitForExist({timeout: 20000});
    await openBolsillo.click();

    const tabTransfer = await $('~tab-transferir');
    await tabTransfer.waitForExist({timeout: 8000});
    await tabTransfer.click();

    const nameInput = await $('~transfer-name-input');
    await nameInput.setValue('Juan Test');
    const ccBtn = await $('~doc-type-CC');
    await ccBtn.click();
    const docInput = await $('~transfer-doc-input');
    await docInput.setValue('12345678');
    const amountInput = await $('~transfer-amount-input');
    await amountInput.setValue('1200');

    const sendBtn = await $('~transfer-send');
    await sendBtn.click();

    try {
      await driver.acceptAlert();
    } catch {}
    try {
      await driver.acceptAlert();
    } catch {}

    const favBtn = await $('~open-fav-list');
    await favBtn.waitForExist({timeout: 12000});
    await favBtn.click();

    const search = await $('~fav-search');
    await search.waitForExist({timeout: 8000});
    await search.setValue('8765');

    const item = await $(
      'android=new UiSelector().description("fav-item-CC-12345678")',
    );
    await item.waitForExist({timeout: 8000});

    const edit = await $(
      'android=new UiSelector().description("fav-edit-CC-12345678")',
    );
    await edit.click();
    const editName = await $('~fav-edit-name-input');
    await editName.waitForExist({timeout: 8000});
    await editName.setValue('Juan Actualizado');
    const save = await $('~fav-save');
    await save.click();
    await editName.waitForExist({timeout: 8000, reverse: true});

    await item.click();

    const favAmount = await $(
      'android=new UiSelector().description("fav-amount-input")',
    );
    await favAmount.waitForExist({timeout: 8000});
    await favAmount.setValue('1200');
    const confirm = await $(
      'android=new UiSelector().description("fav-confirm")',
    );
    await confirm.click();
    await favAmount.waitForExist({timeout: 10000, reverse: true});

    await favBtn.click();
    const del = await $(
      'android=new UiSelector().description("fav-delete-CC-12345678")',
    );
    await del.waitForExist({timeout: 8000});
    await del.click();
    const itemGone = await $(
      'android=new UiSelector().description("fav-item-CC-12345678")',
    );
    await itemGone.waitForExist({timeout: 8000, reverse: true});
  });
});
