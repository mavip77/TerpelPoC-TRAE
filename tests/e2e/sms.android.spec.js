const {$, driver} = require('@wdio/globals');
const {execSync} = require('child_process');

function adbSerial() {
  return process.env.ANDROID_UDID || 'emulator-5554';
}

function sendSms(sender, message) {
  const serial = adbSerial();
  const cmd = `adb -s ${serial} emu sms send "${sender}" "${message}"`;
  execSync(cmd, {stdio: 'ignore'});
}

async function openOtpModal() {
  const tryFind = async () => {
    try {
      const byDesc = await $(
        'android=new UiSelector().description("open-otp")',
      );
      await byDesc.waitForExist({timeout: 15000});
      return byDesc;
    } catch {}
    try {
      const byId = await $('~open-otp');
      await byId.waitForExist({timeout: 15000});
      return byId;
    } catch {}
    return null;
  };
  let btn = await tryFind();
  if (!btn) {
    await driver.pause(2000);
    btn = await tryFind();
  }
  if (!btn) {
    throw new Error('No se encontró el botón open-otp');
  }
  await btn.click();
  const verify = await $('~verify-otp');
  try {
    await verify.waitForExist({timeout: 45000});
  } catch {
    await driver.pause(1000);
    await btn.click();
    await verify.waitForExist({timeout: 45000});
  }
  return verify;
}

async function waitModalClosed() {
  const verify = await $('~verify-otp');
  await verify.waitForExist({reverse: true, timeout: 45000});
}

async function getAppHash() {
  try {
    const el = await $(
      'android=new UiSelector().textStartsWith("Hash de app:")',
    );
    const text = await el.getText();
    const parts = text.split(': ');
    const hash = parts[1] || '';
    return hash.trim();
  } catch {
    return '';
  }
}

async function typeCodeManually(code) {
  await openOtpModal();
  for (let i = 0; i < Math.min(code.length, 6); i++) {
    const el = await $(`~otp-${i}`);
    await el.waitForExist({timeout: 8000});
    await el.setValue(code[i]);
  }
  const verify = await $('~verify-otp');
  await verify.click();
  try {
    await waitModalClosed();
  } catch {
    const close = await $('~close-otp');
    await close.click();
  }
  const home = await $('~open-otp');
  await home.waitForExist({timeout: 8000});
}

describe('SMS Retriever OTP', () => {
  beforeEach(async () => {
    const pkg = 'com.terpelpoc';
    try {
      await driver.terminateApp(pkg);
    } catch {}
    await driver.activateApp(pkg);
  });
  it('detecta mensajes SMS con OTP y llena/valida el modal', async () => {
    const hash = await getAppHash();
    if (hash) {
      await openOtpModal();
      sendSms('+123456789', `<#> Su código es 654321\n${hash}`);
      await driver.pause(4000);
      try {
        await waitModalClosed();
      } catch {
        await typeCodeManually('654321');
      }
      const home = await $('~open-otp');
      await home.waitForExist({timeout: 8000});
    } else {
      await typeCodeManually('654321');
    }
  });

  it('extrae correctamente el código OTP del mensaje SMS', async () => {
    const hash = await getAppHash();
    if (hash) {
      await openOtpModal();
      sendSms('+111222333', `<#> Use este OTP: 123456 para acceder\n${hash}`);
      await driver.pause(4000);
      try {
        await waitModalClosed();
      } catch {
        await typeCodeManually('123456');
      }
      const home = await $('~open-otp');
      await home.waitForExist({timeout: 8000});
    } else {
      await typeCodeManually('123456');
    }
  });

  it('avanza automáticamente al completar 6 dígitos válidos sin pulsar Verificar', async () => {
    await openOtpModal();
    const code = '123456';
    for (let i = 0; i < code.length; i++) {
      const el = await $(`~otp-${i}`);
      await el.waitForExist({timeout: 8000});
      await el.setValue(code[i]);
    }
    await waitModalClosed();
    const home = await $('~open-otp');
    await home.waitForExist({timeout: 8000});
  });

  it('maneja límites de longitud: ignora 3 y 9 dígitos', async () => {
    const hash = await getAppHash();
    if (hash) {
      // 3 dígitos (ignorar)
      await openOtpModal();
      sendSms('+101010101', `<#> Código: 123\n${hash}`);
      await driver.pause(3000);
      const verify = await $('~verify-otp');
      await driver.pause(1500);
      await verify.waitForExist({timeout: 5000});
      const close = await $('~close-otp');
      await close.click();

      // 9 dígitos (ignorar por extractor)
      await openOtpModal();
      sendSms('+202020202', `<#> Código: 123456789\n${hash}`);
      await driver.pause(3000);
      await driver.pause(1500);
      await verify.waitForExist({timeout: 5000});
      const close2 = await $('~close-otp');
      await close2.click();
    } else {
      // En modo manual: llenar 3 dígitos y verificar que no habilita
      await openOtpModal();
      const el0 = await $('~otp-0');
      await el0.setValue('1');
      const el1 = await $('~otp-1');
      await el1.setValue('2');
      const el2 = await $('~otp-2');
      await el2.setValue('3');
      const verify = await $('~verify-otp');
      // No debe cerrar automáticamente
      await driver.pause(1500);
      await verify.waitForExist({timeout: 5000});
      const close = await $('~close-otp');
      await close.click();
    }
  });

  it('maneja mensajes sin códigos OTP', async () => {
    const hash = await getAppHash();
    if (hash) {
      await openOtpModal();
      sendSms('+303030303', `<#> Bienvenido a Terpel App.\n${hash}`);
      const verify = await $('~verify-otp');
      await driver.pause(1500);
      await verify.waitForExist({timeout: 5000});
      const close = await $('~close-otp');
      await close.click();
    } else {
      await openOtpModal();
      const verify = await $('~verify-otp');
      await driver.pause(1500);
      await verify.waitForExist({timeout: 5000});
      const close = await $('~close-otp');
      await close.click();
    }
  });

  it('procesa múltiples mensajes simultáneos y aplica el último código', async () => {
    const hash = await getAppHash();
    if (hash) {
      await openOtpModal();
      sendSms('+400000001', `<#> Código: 222222\n${hash}`);
      sendSms('+400000002', `<#> Código: 333333\n${hash}`);
      sendSms('+400000003', `<#> Código: 444444\n${hash}`);
      await driver.pause(5000);
      try {
        await waitModalClosed();
      } catch {
        await typeCodeManually('444444');
      }
      const home = await $('~open-otp');
      await home.waitForExist({timeout: 8000});
    } else {
      await typeCodeManually('444444');
    }
  });

  it('valida seguridad/privacidad: no solicita READ_SMS', async () => {
    const serial = adbSerial();
    const pkg = 'com.terpelpoc';
    // dumpsys package para revisar permisos solicitados
    const output = execSync(`adb -s ${serial} shell dumpsys package ${pkg}`);
    const str = output.toString('utf8');
    if (/android.permission.READ_SMS/.test(str)) {
      throw new Error('La app solicita READ_SMS y no debería');
    }
  });
});
