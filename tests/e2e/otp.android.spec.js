const { $, driver } = require('@wdio/globals');

describe('OTP Modal Android', () => {
  it('abre y cierra el modal OTP', async () => {
    let btn = await $('~open-otp');
    await btn.waitForExist({ timeout: 15000 });
    if (!(await btn.isExisting())) {
      btn = await $('android=new UiSelector().text("Abrir OTP")');
    }
    await btn.click();
    const verify = await $('~verify-otp');
    await verify.waitForExist({ timeout: 8000 });
    await driver.back();
    await verify.waitForExist({ reverse: true, timeout: 8000 });
  });

  it('ingresa código y verifica cierre', async () => {
    let btn = await $('~open-otp');
    await btn.waitForExist({ timeout: 15000 });
    if (!(await btn.isExisting())) {
      btn = await $('android=new UiSelector().text("Abrir OTP")');
    }
    await btn.click();
    for (let i = 0; i < 6; i++) {
      const field = await $(`~otp-${i}`);
      await field.waitForExist({ timeout: 5000 });
      await field.setValue(String(i + 1));
    }
    const verify = await $('~verify-otp');
    await verify.waitForEnabled({ timeout: 5000 });
    await verify.click();
    await verify.waitForExist({ reverse: true, timeout: 8000 });
  });
});
