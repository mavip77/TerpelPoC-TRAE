const {$, driver} = require('@wdio/globals');

async function openOtpModal() {
  const btn = await $('~open-otp');
  await btn.waitForExist({timeout: 15000});
  await btn.click();
  const modal = await $('~otp-modal');
  await modal.waitForExist({timeout: 15000});
  const verify = await $('~verify-otp');
  await verify.waitForExist({timeout: 15000});
}

describe('Autofill iOS oneTimeCode', () => {
  beforeEach(async () => {
    await driver.activateApp('org.reactjs.native.example.TerpelPoC');
  });

  it('cierra el modal automáticamente tras autocompletar', async () => {
    await openOtpModal();

    const d0 = await $('~otp-0');
    const d1 = await $('~otp-1');
    const d2 = await $('~otp-2');
    const d3 = await $('~otp-3');
    const d4 = await $('~otp-4');
    const d5 = await $('~otp-5');
    await d0.waitForExist({timeout: 10000});
    await d0.setValue('1');
    await d1.setValue('2');
    await d2.setValue('3');
    await d3.setValue('4');
    await d4.setValue('5');
    await d5.setValue('6');

    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 5000});
    await verifyBtn.click();
    await verifyBtn.waitForExist({timeout: 8000, reverse: true});

    const modalEl = await $('~otp-modal');
    await modalEl.waitForExist({timeout: 8000, reverse: true});

    const homeBtn = await $('~open-otp');
    await homeBtn.waitForExist({timeout: 8000});
  });
});
