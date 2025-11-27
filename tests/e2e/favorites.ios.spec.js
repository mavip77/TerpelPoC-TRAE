const {$, driver} = require('@wdio/globals');

describe('Favoritos iOS - CRUD y transferir', () => {
  beforeEach(async () => {
    await driver.activateApp('org.reactjs.native.example.TerpelPoC');
  });

  it('crea, busca, edita, elimina y transfiere desde favorito', async () => {
    const openBolsillo = await $('~open-mi-bolsillo');
    await openBolsillo.waitForExist({timeout: 15000});
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

    const item = await $('~fav-item-CC-12345678');
    await item.waitForExist({timeout: 8000});

    const edit = await $('~fav-edit-CC-12345678');
    await edit.click();
    const editName = await $('~fav-edit-name-input');
    await editName.waitForExist({timeout: 8000});
    await editName.setValue('Juan Actualizado');
    const save = await $('~fav-save');
    await save.click();
    await editName.waitForExist({timeout: 8000, reverse: true});

    await item.click();

    const favAmount = await $('~fav-amount-input');
    await favAmount.waitForExist({timeout: 8000});
    await favAmount.setValue('1200');
    const confirm = await $('~fav-confirm');
    await confirm.click();
    await favAmount.waitForExist({timeout: 10000, reverse: true});

    await favBtn.click();
    const del = await $('~fav-delete-CC-12345678');
    await del.waitForExist({timeout: 8000});
    await del.click();
    await item.waitForExist({timeout: 8000, reverse: true});
  });
});
