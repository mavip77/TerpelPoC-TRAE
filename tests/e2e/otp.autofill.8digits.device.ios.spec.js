const { $, driver } = require('@wdio/globals');

/**
 * E2E: Autofill OTP de 8 dígitos en dispositivo REAL iOS.
 * Valida que oneTimeCode rellene los 8 campos y cierre el modal sin pulsar Verificar.
 * Basado en otp.autofill.device.ios.spec.js, actualizado de 6 a 8 dígitos.
 * Solo se ejecuta cuando IOS_REAL_DEVICE=1.
 */

function isRealDevice() {
    return process.env.IOS_REAL_DEVICE === '1';
}

async function openOtpModal() {
    const btn = await $('~open-otp');
    await btn.waitForExist({ timeout: 15000 });
    await btn.click();
    const modal = await $('~otp-modal');
    await modal.waitForExist({ timeout: 15000 });
    const verify = await $('~verify-otp');
    await verify.waitForExist({ timeout: 15000 });
}

describe('Autofill iOS Real Device – 8 dígitos', () => {
    beforeEach(async () => {
        await driver.activateApp('org.reactjs.native.example.TerpelPoC');
    });

    (isRealDevice() ? it : it.skip)(
        'cierra sin pulsar Verificar tras autocompletar 8 dígitos (oneTimeCode)',
        async () => {
            await openOtpModal();

            const code = '18374256';
            for (let i = 0; i < 8; i++) {
                const field = await $(`~otp-${i}`);
                await field.waitForExist({ timeout: 10000 });
                await field.setValue(code[i]);
            }

            const verifyBtn = await $('~verify-otp');
            await verifyBtn.waitForExist({ timeout: 12000, reverse: true });
            const modalEl = await $('~otp-modal');
            await modalEl.waitForExist({ timeout: 12000, reverse: true });
            const homeBtn = await $('~open-otp');
            await homeBtn.waitForExist({ timeout: 8000 });
        },
    );

    (isRealDevice() ? it : it.skip)(
        'NO cierra automáticamente con solo 6 de 8 dígitos (oneTimeCode)',
        async () => {
            await openOtpModal();

            const partialCode = '183742';
            for (let i = 0; i < partialCode.length; i++) {
                const field = await $(`~otp-${i}`);
                await field.waitForExist({ timeout: 10000 });
                await field.setValue(partialCode[i]);
            }

            // El modal NO debe cerrarse con solo 6 dígitos
            await driver.pause(3000);
            const verifyBtn = await $('~verify-otp');
            await verifyBtn.waitForExist({ timeout: 5000 });

            // Cerrar manualmente
            const close = await $('~close-otp');
            await close.click();
            const homeBtn = await $('~open-otp');
            await homeBtn.waitForExist({ timeout: 8000 });
        },
    );

    (isRealDevice() ? it : it.skip)(
        'autocompletar 8 dígitos de golpe cierra el modal (oneTimeCode)',
        async () => {
            await openOtpModal();

            const field0 = await $('~otp-0');
            await field0.waitForExist({ timeout: 10000 });
            await field0.setValue('65432187');

            const verifyBtn = await $('~verify-otp');
            await verifyBtn.waitForExist({ timeout: 12000, reverse: true });
            const modalEl = await $('~otp-modal');
            await modalEl.waitForExist({ timeout: 12000, reverse: true });
            const homeBtn = await $('~open-otp');
            await homeBtn.waitForExist({ timeout: 8000 });
        },
    );
});
