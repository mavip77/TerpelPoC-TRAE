const { $, expect } = require('@wdio/globals');
describe('Android app', () => {
  it('launches and shows open-otp button', async () => {
    const el = await $('~open-otp');
    await el.waitForExist({ timeout: 15000 });
    let exists = await el.isExisting();
    if (!exists) {
      const txt = await $('android=new UiSelector().text("Abrir OTP")');
      await txt.waitForExist({ timeout: 15000 });
      exists = await txt.isExisting();
    }
    expect(exists).toBe(true);
  });
});
