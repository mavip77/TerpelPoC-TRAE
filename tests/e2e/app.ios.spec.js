const { $, expect } = require('@wdio/globals');
describe('iOS app', () => {
  it('launches and shows open-otp button', async () => {
    const el = await $('~open-otp');
    await el.waitForExist({timeout: 15000});
    expect(await el.isExisting()).toBe(true);
  });
});
