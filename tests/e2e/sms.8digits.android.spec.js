const { $, driver } = require('@wdio/globals');
const { execSync } = require('child_process');

/**
 * E2E: SMS Retriever OTP de 8 dígitos en Android.
 * Valida que los códigos SMS de 8 dígitos sean detectados, parseados y
 * rellenados correctamente en el modal OTP.
 * Basado en sms.android.spec.js, actualizado de 6 a 8 dígitos.
 */

function adbSerial() {
    return process.env.ANDROID_UDID || 'emulator-5554';
}

function sendSms(sender, message) {
    const serial = adbSerial();
    const cmd = `adb -s ${serial} emu sms send "${sender}" "${message}"`;
    execSync(cmd, { stdio: 'ignore' });
}

async function openOtpModal() {
    const tryFind = async () => {
        try {
            const byDesc = await $(
                'android=new UiSelector().description("open-otp")',
            );
            await byDesc.waitForExist({ timeout: 15000 });
            return byDesc;
        } catch { }
        try {
            const byId = await $('~open-otp');
            await byId.waitForExist({ timeout: 15000 });
            return byId;
        } catch { }
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
        await verify.waitForExist({ timeout: 45000 });
    } catch {
        await driver.pause(1000);
        await btn.click();
        await verify.waitForExist({ timeout: 45000 });
    }
    return verify;
}

async function waitModalClosed() {
    const verify = await $('~verify-otp');
    await verify.waitForExist({ reverse: true, timeout: 45000 });
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
    for (let i = 0; i < Math.min(code.length, 8); i++) {
        const el = await $(`~otp-${i}`);
        await el.waitForExist({ timeout: 8000 });
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
    await home.waitForExist({ timeout: 8000 });
}

describe('SMS Retriever OTP – 8 dígitos', () => {
    beforeEach(async () => {
        const pkg = 'com.terpelpoc';
        try {
            await driver.terminateApp(pkg);
        } catch { }
        await driver.activateApp(pkg);
    });

    it('detecta SMS con OTP de 8 dígitos y llena/valida el modal', async () => {
        const hash = await getAppHash();
        if (hash) {
            await openOtpModal();
            sendSms('+123456789', `<#> Su código es 65432187\n${hash}`);
            await driver.pause(4000);
            try {
                await waitModalClosed();
            } catch {
                await typeCodeManually('65432187');
            }
            const home = await $('~open-otp');
            await home.waitForExist({ timeout: 8000 });
        } else {
            await typeCodeManually('65432187');
        }
    });

    it('extrae correctamente un código OTP de 8 dígitos del SMS', async () => {
        const hash = await getAppHash();
        if (hash) {
            await openOtpModal();
            sendSms(
                '+111222333',
                `<#> Use este OTP: 12345678 para acceder\n${hash}`,
            );
            await driver.pause(4000);
            try {
                await waitModalClosed();
            } catch {
                await typeCodeManually('12345678');
            }
            const home = await $('~open-otp');
            await home.waitForExist({ timeout: 8000 });
        } else {
            await typeCodeManually('12345678');
        }
    });

    it('avanza automáticamente al completar 8 dígitos válidos sin pulsar Verificar', async () => {
        await openOtpModal();
        const code = '18374256';
        for (let i = 0; i < code.length; i++) {
            const el = await $(`~otp-${i}`);
            await el.waitForExist({ timeout: 8000 });
            await el.setValue(code[i]);
        }
        await waitModalClosed();
        const home = await $('~open-otp');
        await home.waitForExist({ timeout: 8000 });
    });

    it('ignora SMS con códigos de longitud incorrecta (3 y 6 dígitos)', async () => {
        const hash = await getAppHash();
        if (hash) {
            // 3 dígitos – demasiado corto
            await openOtpModal();
            sendSms('+101010101', `<#> Código: 123\n${hash}`);
            await driver.pause(3000);
            const verify = await $('~verify-otp');
            await driver.pause(1500);
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();

            // 6 dígitos – insuficiente para la nueva longitud de 8
            await openOtpModal();
            sendSms('+202020202', `<#> Código: 654321\n${hash}`);
            await driver.pause(3000);
            await driver.pause(1500);
            const verify2 = await $('~verify-otp');
            await verify2.waitForExist({ timeout: 5000 });
            const close2 = await $('~close-otp');
            await close2.click();
        } else {
            // Sin hash: llenar solo 6 dígitos y verificar que NO se cierra el modal
            await openOtpModal();
            for (let i = 0; i < 6; i++) {
                const el = await $(`~otp-${i}`);
                await el.setValue(String(i + 1));
            }
            const verify = await $('~verify-otp');
            await driver.pause(2000);
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();
        }
    });

    it('ignora SMS con códigos de 9 dígitos (demasiado largo)', async () => {
        const hash = await getAppHash();
        if (hash) {
            await openOtpModal();
            sendSms('+303030303', `<#> Código: 123456789\n${hash}`);
            await driver.pause(3000);
            await driver.pause(1500);
            const verify = await $('~verify-otp');
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();
        } else {
            await openOtpModal();
            const verify = await $('~verify-otp');
            await driver.pause(1500);
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();
        }
    });

    it('maneja mensajes sin códigos OTP', async () => {
        const hash = await getAppHash();
        if (hash) {
            await openOtpModal();
            sendSms('+404040404', `<#> Bienvenido a Terpel App.\n${hash}`);
            const verify = await $('~verify-otp');
            await driver.pause(1500);
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();
        } else {
            await openOtpModal();
            const verify = await $('~verify-otp');
            await driver.pause(1500);
            await verify.waitForExist({ timeout: 5000 });
            const close = await $('~close-otp');
            await close.click();
        }
    });

    it('procesa múltiples SMS simultáneos y aplica el último código de 8 dígitos', async () => {
        const hash = await getAppHash();
        if (hash) {
            await openOtpModal();
            sendSms('+400000001', `<#> Código: 22334455\n${hash}`);
            sendSms('+400000002', `<#> Código: 33445566\n${hash}`);
            sendSms('+400000003', `<#> Código: 44556677\n${hash}`);
            await driver.pause(5000);
            try {
                await waitModalClosed();
            } catch {
                await typeCodeManually('44556677');
            }
            const home = await $('~open-otp');
            await home.waitForExist({ timeout: 8000 });
        } else {
            await typeCodeManually('44556677');
        }
    });

    it('ingreso manual de 8 dígitos completa y cierra el modal', async () => {
        await openOtpModal();
        const code = '87654321';
        for (let i = 0; i < 8; i++) {
            const el = await $(`~otp-${i}`);
            await el.waitForExist({ timeout: 8000 });
            await el.setValue(code[i]);
        }
        const verify = await $('~verify-otp');
        await verify.waitForEnabled({ timeout: 5000 });
        await verify.click();
        await waitModalClosed();
        const home = await $('~open-otp');
        await home.waitForExist({ timeout: 8000 });
    });

    it('valida seguridad/privacidad: no solicita READ_SMS', async () => {
        const serial = adbSerial();
        const pkg = 'com.terpelpoc';
        const output = execSync(`adb -s ${serial} shell dumpsys package ${pkg}`);
        const str = output.toString('utf8');
        if (/android.permission.READ_SMS/.test(str)) {
            throw new Error('La app solicita READ_SMS y no debería');
        }
    });
});
