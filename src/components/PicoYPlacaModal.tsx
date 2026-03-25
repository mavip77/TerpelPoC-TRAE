import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    checkPicoPlaca,
    City,
    PicoPlacaResult,
    VehicleType,
} from '../utils/picoPlaca';

const { width: SCREEN_W } = Dimensions.get('window');

export type PicoPlacaSaveData = {
    vehicle: VehicleType;
    city: City;
    plate: string;
    result: PicoPlacaResult;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave?: (data: PicoPlacaSaveData) => void;
};

const VEHICLE_OPTIONS: { label: string; value: VehicleType; icon: string }[] = [
    { label: 'Carro', value: 'carro', icon: 'car' },
    { label: 'Moto', value: 'moto', icon: 'motorbike' },
];

const CITY_OPTIONS: { label: string; value: City }[] = [
    { label: 'Bogotá', value: 'bogota' },
    { label: 'Medellín', value: 'medellin' },
];

export default function PicoYPlacaModal({ visible, onClose, onSave }: Props) {
    const [vehicle, setVehicle] = useState<VehicleType>('carro');
    const [city, setCity] = useState<City>('bogota');
    const [plate, setPlate] = useState('');
    const [result, setResult] = useState<PicoPlacaResult | null>(null);

    const handleSave = useCallback(() => {
        const r = checkPicoPlaca(vehicle, city, plate);
        setResult(r);
        onSave?.({ vehicle, city, plate, result: r });
        onClose();
    }, [vehicle, city, plate, onSave, onClose]);

    const handleClose = useCallback(() => {
        setResult(null);
        setPlate('');
        onClose();
    }, [onClose]);

    const plateHasDigit = /[0-9]/.test(plate);

    return (
        <Modal
            isVisible={visible}
            style={styles.modal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            onBackdropPress={handleClose}
            onBackButtonPress={handleClose}
            useNativeDriver
            statusBarTranslucent>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Icon name="car-clock" size={28} color="#FFF" />
                    <Text style={styles.headerTitle}>Pico y Placa</Text>
                    <TouchableOpacity
                        onPress={handleClose}
                        accessibilityLabel="Cerrar pico y placa"
                        testID="pyp-close">
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    keyboardShouldPersistTaps="handled">
                    <Text style={styles.subtitle}>
                        Consulta si tu vehículo tiene restricción hoy
                    </Text>

                    {/* Tipo de vehículo */}
                    <Text style={styles.label}>Tipo de vehículo</Text>
                    <View style={styles.optionRow}>
                        {VEHICLE_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                testID={`pyp-vehicle-${opt.value}`}
                                style={[
                                    styles.optionBtn,
                                    vehicle === opt.value && styles.optionBtnActive,
                                ]}
                                onPress={() => {
                                    setVehicle(opt.value);
                                    setResult(null);
                                }}>
                                <Icon
                                    name={opt.icon}
                                    size={22}
                                    color={vehicle === opt.value ? '#FFF' : '#E31E24'}
                                />
                                <Text
                                    style={[
                                        styles.optionText,
                                        vehicle === opt.value && styles.optionTextActive,
                                    ]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Ciudad */}
                    <Text style={styles.label}>Ciudad</Text>
                    <View style={styles.optionRow}>
                        {CITY_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                testID={`pyp-city-${opt.value}`}
                                style={[
                                    styles.optionBtn,
                                    city === opt.value && styles.optionBtnActive,
                                ]}
                                onPress={() => {
                                    setCity(opt.value);
                                    setResult(null);
                                }}>
                                <Text
                                    style={[
                                        styles.optionText,
                                        city === opt.value && styles.optionTextActive,
                                    ]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Placa */}
                    <Text style={styles.label}>Número de placa</Text>
                    <TextInput
                        testID="pyp-plate-input"
                        style={styles.plateInput}
                        value={plate}
                        onChangeText={t => {
                            setPlate(t.toUpperCase());
                            setResult(null);
                        }}
                        placeholder="Ej: ABC 123"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        maxLength={7}
                    />

                    {/* Guardar button */}
                    <TouchableOpacity
                        testID="pyp-check-btn"
                        style={[styles.checkBtn, !plateHasDigit && styles.checkBtnDisabled]}
                        onPress={handleSave}
                        disabled={!plateHasDigit}>
                        <Text style={styles.checkBtnText}>Guardar</Text>
                    </TouchableOpacity>

                    {/* Resultado */}
                    {result && (
                        <View
                            testID="pyp-result"
                            style={[
                                styles.resultBox,
                                result.restricted ? styles.resultRestricted : styles.resultFree,
                            ]}>
                            <Icon
                                name={result.restricted ? 'alert-circle' : 'check-circle'}
                                size={32}
                                color={result.restricted ? '#DC2626' : '#16A34A'}
                            />
                            <Text style={styles.resultText}>{result.message}</Text>
                        </View>
                    )}

                    {/* Info */}
                    <Text style={styles.infoText}>
                        Información basada en las reglas vigentes de pico y placa. Bogotá:
                        lunes a viernes 6:00 a.m. – 9:00 p.m. (días impares → circulan
                        placas 1-5; días pares → circulan placas 6-0). Medellín: lunes a
                        viernes 5:00 a.m. – 8:00 p.m. Consulte fuentes oficiales.
                    </Text>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: Dimensions.get('window').height * 0.92,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#E31E24',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        gap: 10,
    },
    headerTitle: {
        flex: 1,
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
    },
    body: {
        flexShrink: 1,
    },
    bodyContent: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        marginTop: 12,
    },
    optionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    optionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E31E24',
        backgroundColor: '#FFF',
    },
    optionBtnActive: {
        backgroundColor: '#E31E24',
    },
    optionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E31E24',
    },
    optionTextActive: {
        color: '#FFF',
    },
    plateInput: {
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: 2,
        textAlign: 'center',
        backgroundColor: '#F9FAFB',
    },
    checkBtn: {
        backgroundColor: '#E31E24',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    checkBtnDisabled: {
        opacity: 0.45,
    },
    checkBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    resultBox: {
        marginTop: 20,
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resultRestricted: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    resultFree: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    resultText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        lineHeight: 22,
    },
    infoText: {
        marginTop: 20,
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 17,
    },
});
