const {$, driver} = require('@wdio/globals');

async function openOtpModal() {
  const btn = await $('~open-otp');
  await btn.waitForExist({timeout: 15000});
  await btn.click();
  const modal = await $('~otp-modal');
  await modal.waitForExist({timeout: 15000});
  const verify = await $('~verify-otp');
  await verify.waitForExist({timeout: 15000});
  return {modal, verify};
}

async function fillCode(code) {
  for (let i = 0; i < 6; i++) {
    const el = await $(`~otp-${i}`);
    await el.waitForExist({timeout: 8000});
    await el.setValue(code[i] || '');
  }
}

describe('HU 29675 - Validación y avance automático (Android)', () => {
  beforeEach(async () => {
    const pkg = 'com.terpelpoc';
    try {
      await driver.terminateApp(pkg);
    } catch {}
    await driver.activateApp(pkg);
  });

  it('29679: avanza automáticamente con OTP correcto', async () => {
    await openOtpModal();
    await fillCode('123456');
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 5000});
    await verifyBtn.click();
    const modal = await $('~otp-modal');
    await modal.waitForExist({timeout: 1500, reverse: true});
    const homeBtn = await $('~open-otp');
    await homeBtn.waitForExist({timeout: 8000});
  });

  it('29680: no avanza con OTP incorrecto', async () => {
    await openOtpModal();
    await fillCode('000000');
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 5000});
    await verifyBtn.click();
    const modal = await $('~otp-modal');
    await modal.waitForExist({timeout: 2000});
  });

  it('29681: longitud correcta requerida (6 dígitos)', async () => {
    await openOtpModal();
    await fillCode('12345');
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 2000, reverse: true});
  });

  it('29682: no puede avanzar sin código', async () => {
    await openOtpModal();
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 2000, reverse: true});
  });

  it('29683: no avanza con caracteres no numéricos', async () => {
    await openOtpModal();
    const d0 = await $('~otp-0');
    await d0.setValue('a');
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 2000, reverse: true});
  });

  it('29684: experiencia fluida al ingresar OTP correcto (cierre < 1.5s)', async () => {
    await openOtpModal();
    const start = Date.now();
    await fillCode('123456');
    const verifyBtn = await $('~verify-otp');
    await verifyBtn.waitForEnabled({timeout: 5000});
    await verifyBtn.click();
    const modal = await $('~otp-modal');
    await modal.waitForExist({timeout: 1500, reverse: true});
    const elapsed = Date.now() - start;
    if (elapsed > 1500) {
      throw new Error(`Cierre no fluido: ${elapsed}ms`);
    }
  });
});
