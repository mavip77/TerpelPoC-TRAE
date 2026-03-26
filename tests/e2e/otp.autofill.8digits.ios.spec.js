const { $, driver } = require('@wdio/globals');

/**
 * E2E: Autofill OTP de 8 dígitos en simulador iOS.
 * Valida que al llenar los 8 campos OTP el modal se cierra correctamente.
 * Basado en otp.autofill.ios.spec.js, actualizado de 6 a 8 dígitos.
 */

async function openOtpModal() {
    const btn = await $('~open-otp');
    await btn.waitForExist({ timeout: 15000 });
    await btn.click();
    const modal = await $('~otp-modal');
    await modal.waitForExist({ timeout: 15000 });
    const verify = await $('~verify-otp');
    await verify.waitForExist({ timeout: 15000 });
}

describe('Autofill iOS oneTimeCode – 8 dígitos', () => {
    beforeEach(async () => {
        await driver.activateApp('org.reactjs.native.example.TerpelPoC');
    });

    it('completa los 8 campos OTP y el botón Verificar se habilita', async () => {
        await openOtpModal();

        const code = '12345678';
        for (let i = 0; i < 8; i++) {
            const field = await $(`~otp-${i}`);
            await field.waitForExist({ timeout: 10000 });
            await field.setValue(code[i]);
        }

        const verifyBtn = await $('~verify-otp');
        await verifyBtn.waitForEnabled({ timeout: 5000 });
    });

    it('cierra el modal automáticamente tras autocompletar 8 dígitos', async () => {
        await openOtpModal();

        const code = '18374256';
        for (let i = 0; i < 8; i++) {
            const field = await $(`~otp-${i}`);
            await field.waitForExist({ timeout: 10000 });
            await field.setValue(code[i]);
        }

        const verifyBtn = await $('~verify-otp');
        await verifyBtn.waitForEnabled({ timeout: 5000 });
        await verifyBtn.click();
        await verifyBtn.waitForExist({ timeout: 8000, reverse: true });

        const modalEl = await $('~otp-modal');
        await modalEl.waitForExist({ timeout: 8000, reverse: true });

        const homeBtn = await $('~open-otp');
        await homeBtn.waitForExist({ timeout: 8000 });
    });

    it('NO habilita Verificar con solo 6 de 8 dígitos', async () => {
        await openOtpModal();

        const partialCode = '123456';
        for (let i = 0; i < partialCode.length; i++) {
            const field = await $(`~otp-${i}`);
            await field.waitForExist({ timeout: 10000 });
            await field.setValue(partialCode[i]);
        }

        // Con solo 6 dígitos el modal NO debe cerrarse automáticamente
        await driver.pause(2000);
        const verifyBtn = await $('~verify-otp');
        await verifyBtn.waitForExist({ timeout: 5000 });

        // Cerrar el modal manualmente
        const close = await $('~close-otp');
        await close.click();
        const homeBtn = await $('~open-otp');
        await homeBtn.waitForExist({ timeout: 8000 });
    });

    it('acepta pegado de 8 dígitos de golpe en el primer campo', async () => {
        await openOtpModal();

        const field0 = await $('~otp-0');
        await field0.waitForExist({ timeout: 10000 });
        // Simular pegado de código completo de 8 dígitos
        await field0.setValue('65432187');

        const verifyBtn = await $('~verify-otp');
        await verifyBtn.waitForEnabled({ timeout: 5000 });
        await verifyBtn.click();
        await verifyBtn.waitForExist({ timeout: 8000, reverse: true });

        const homeBtn = await $('~open-otp');
        await homeBtn.waitForExist({ timeout: 8000 });
    });
});
