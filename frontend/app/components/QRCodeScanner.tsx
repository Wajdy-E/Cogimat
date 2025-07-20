import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { i18n } from '../i18n';
import { useTheme } from '@/components/ui/ThemeProvider';
import { ArrowLeft, Camera as CameraIcon, QrCode } from 'lucide-react-native';

interface QRCodeScannerProps {
	onQRCodeScanned: (qrCode: string) => void;
	onClose: () => void;
}

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width, height) * 0.7;

export default function QRCodeScanner ({ onQRCodeScanned, onClose }: QRCodeScannerProps) {
	const [scanned, setScanned] = useState(false);
	const [scannerError, setScannerError] = useState<string | null>(null);
	const { themeTextColor } = useTheme();
	const [permission, requestPermission] = useCameraPermissions();

	useEffect(() => {
		if (!permission) {
			requestPermission();
		}
	}, [permission, requestPermission]);

	const handleBarCodeScanned = (result: BarcodeScanningResult) => {
		try {
			if (scanned) {
				return;
			} // Prevent multiple scans

			setScanned(true);
			const data = result.data;

			// Validate that it's a Cogimat QR code
			if (data && data.startsWith('COGIMAT-')) {
				onQRCodeScanned(data);
			} else {
				Alert.alert(i18n.t('qrScanner.invalidCode'), i18n.t('qrScanner.invalidCodeMessage'), [
					{
						text: i18n.t('general.buttons.ok'),
						onPress: () => setScanned(false),
					},
				]);
			}
		} catch (error) {
			console.error('Error handling barcode scan:', error);
			setScanned(false);
		}
	};

	const resetScanner = () => {
		setScanned(false);
	};

	// Show placeholder for development/testing (set to false to use real camera)
	const showPlaceholder = false; // Set to false when camera scanner is working

	if (showPlaceholder) {
		return (
			<View style={styles.container}>
				<View style={styles.overlay}>
					{/* Header */}
					<View style={styles.header}>
						<Button onPress={onClose} variant="outline" size="sm">
							<ArrowLeft size={20} color={themeTextColor} />
						</Button>
						<Text style={[styles.headerText, { color: themeTextColor }]}>{i18n.t('qrScanner.scanQRCode')}</Text>
						<View style={{ width: 40 }} />
					</View>

					{/* Placeholder Scan Area */}
					<View style={styles.scanArea}>
						<View style={styles.scanFrame}>
							<Center>
								<QrCode size={64} color="#00ff00" />
								<Text style={styles.placeholderText}>Scanner Placeholder</Text>
								<Text style={styles.placeholderText}>For testing: COGIMAT-TEST123</Text>
							</Center>
						</View>
					</View>

					{/* Instructions */}
					<View style={styles.instructions}>
						<Text style={[styles.instructionText, { color: themeTextColor }]}>{i18n.t('qrScanner.instructions')}</Text>
					</View>

					{/* Test Button */}
					<View style={styles.resetContainer}>
						<Button
							onPress={() => handleBarCodeScanned({ data: 'COGIMAT-TEST123', type: 'qr' } as BarcodeScanningResult)}
							size="lg"
						>
							<ButtonText>Test QR Code</ButtonText>
						</Button>
					</View>
				</View>
			</View>
		);
	}

	// Render loading state
	if (!permission) {
		return (
			<Center className="flex-1 bg-background-700">
				<Text className="text-typography-950">{i18n.t('qrScanner.requestingPermission')}</Text>
			</Center>
		);
	}

	// Render permission denied state
	if (!permission.granted) {
		return (
			<Center className="flex-1 bg-background-700">
				<VStack space="lg" className="items-center">
					<CameraIcon size={64} color={themeTextColor} />
					<Heading size="lg" className="text-typography-950">
						{scannerError || i18n.t('qrScanner.cameraAccessRequired')}
					</Heading>
					<Text className="text-typography-950 text-center px-8">
						{scannerError || i18n.t('qrScanner.cameraAccessMessage')}
					</Text>
					<Button onPress={requestPermission} variant="outline">
						<ButtonText>Grant Permission</ButtonText>
					</Button>
					<Button onPress={onClose} variant="outline">
						<ButtonText>{i18n.t('general.buttons.goBack')}</ButtonText>
					</Button>
				</VStack>
			</Center>
		);
	}

	// Render actual scanner (permission granted)
	return (
		<View style={styles.container}>
			<CameraView
				style={styles.camera}
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ['qr'],
				}}
			>
				<View style={styles.overlay}>
					{/* Header */}
					<View style={styles.header}>
						<Button onPress={onClose} variant="outline" size="sm">
							<ArrowLeft size={20} color={themeTextColor} />
						</Button>
						<Text style={[styles.headerText, { color: themeTextColor }]}>{i18n.t('qrScanner.scanQRCode')}</Text>
						<View style={{ width: 40 }} />
					</View>

					{/* Scan Area */}
					<View style={styles.scanArea}>
						<View style={styles.scanFrame} />
					</View>

					{/* Instructions */}
					<View style={styles.instructions}>
						<Text style={[styles.instructionText, { color: themeTextColor }]}>{i18n.t('qrScanner.instructions')}</Text>
					</View>

					{/* Reset Button */}
					{scanned && (
						<View style={styles.resetContainer}>
							<Button onPress={resetScanner} size="lg">
								<ButtonText>{i18n.t('qrScanner.scanAgain')}</ButtonText>
							</Button>
						</View>
					)}
				</View>
			</CameraView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
	},
	camera: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
	},
	headerText: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	scanArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scanFrame: {
		width: SCAN_AREA_SIZE,
		height: SCAN_AREA_SIZE,
		borderWidth: 2,
		borderColor: '#00ff00',
		backgroundColor: 'transparent',
		borderRadius: 20,
	},
	placeholderText: {
		color: '#00ff00',
		fontSize: 14,
		textAlign: 'center',
		marginTop: 10,
	},
	instructions: {
		paddingHorizontal: 40,
		paddingBottom: 40,
		alignItems: 'center',
	},
	instructionText: {
		fontSize: 16,
		textAlign: 'center',
		lineHeight: 24,
	},
	resetContainer: {
		position: 'absolute',
		bottom: 100,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
});
