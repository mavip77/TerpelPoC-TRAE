const { $, driver } = require('@wdio/globals');

describe('OTP Modal iOS', () => {
  it('abre y cierra el modal OTP', async () => {
    const btn = await $('~open-otp');
    await btn.click();
    const verify = await $('~verify-otp');
    await verify.waitForExist({ timeout: 8000 });
    const close = await $('~close-otp');
    await close.click();
    try {
      await driver.execute('mobile: swipe', {direction: 'down'});
    } catch {}
    const homeBtn = await $('~open-otp');
    await homeBtn.waitForExist({ timeout: 8000 });
    await verify.waitForExist({ reverse: true, timeout: 12000 });
  });

  it('ingresa código y verifica cierre', async () => {
    const btn = await $('~open-otp');
    await btn.click();
    for (let i = 0; i < 6; i++) {
      const field = await $(`~otp-${i}`);
      await field.waitForExist({ timeout: 5000 });
      await field.setValue(String(i + 1));
    }
    const verify = await $('~verify-otp');
    await verify.waitForEnabled({ timeout: 5000 });
    await verify.click();
    await verify.waitForExist({ reverse: true, timeout: 5000 });
  });
});
