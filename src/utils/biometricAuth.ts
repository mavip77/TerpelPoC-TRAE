import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

/**
 * Check whether the device supports biometric authentication.
 * Returns the biometry type string ('FaceID' | 'TouchID' | 'Fingerprint' | …)
 * or `null` when no biometry is available.
 */
export async function getSupportedBiometry(): Promise<string | null> {
    const type = await Keychain.getSupportedBiometryType();
    return type ?? null;
}

/**
 * Prompt biometric authentication.
 *
 * Implementation: we store a lightweight credential protected with
 * `accessControl = BIOMETRY_ANY`. Calling `getGenericPassword` with
 * that service forces the OS biometric prompt.
 *
 * @returns `true` when authentication succeeds, `false` otherwise.
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
    try {
        const biometryType = await getSupportedBiometry();

        if (!biometryType) {
            Alert.alert(
                'Biometría no disponible',
                'Tu dispositivo no soporta autenticación biométrica. No puedes acceder a esta sección.',
            );
            return false;
        }

        // Ensure the biometric-protected credential exists.
        await Keychain.setGenericPassword('biometric', 'auth', {
            service: 'biometric-auth',
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
            accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        });

        // This call triggers the system biometric prompt.
        const result = await Keychain.getGenericPassword({
            service: 'biometric-auth',
            authenticationPrompt: {
                title: 'Autenticación requerida',
                subtitle: 'Verifica tu identidad para continuar',
                cancel: 'Cancelar',
            },
        });

        return !!result;
    } catch {
        // User cancelled or biometric check failed.
        return false;
    }
}
