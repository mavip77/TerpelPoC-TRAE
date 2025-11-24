const { $, expect } = require('@wdio/globals');
describe('iOS app', () => {
  it('launches and shows open-otp button', async () => {
    const el = await $('~open-otp');
    const exists = await el.isExisting();
    expect(exists).toBe(true);
  });
});
