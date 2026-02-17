import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Center } from '@/components/ui/center';
import { Box } from '@/components/ui/box';
import { i18n } from '../../i18n';
import { useTheme } from '@/components/ui/ThemeProvider';
import { QrCode, Download, RefreshCw, BarChart3 } from 'lucide-react-native';
import axios from 'axios';

interface QRCodeStats {
	total_codes: number;
	used_codes: number;
	unused_codes: number;
	active_codes: number;
}

interface QRCode {
	id: number;
	code: string;
	is_used: boolean;
	used_by: string | null;
	used_at: string | null;
	batch_number: number;
	created_at: string;
}

const BASE_URL = process.env.BASE_URL;

export default function QRCodesManagement () {
	const [stats, setStats] = useState<QRCodeStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const { themeTextColor } = useTheme();

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${BASE_URL}/api/admin/qr-codes`);
			setStats(response.data.statistics);
		} catch (error) {
			console.error('Error fetching QR code stats:', error);
			Alert.alert('Error', 'Failed to fetch QR code statistics');
		} finally {
			setLoading(false);
		}
	};

	const generateQRCodes = async () => {
		try {
			setGenerating(true);
			await axios.post(`${BASE_URL}/api/admin/qr-codes`, {
				count: 10000,
				batchSize: 50,
			});
			Alert.alert('Success', '10,000 QR codes generated successfully!');
			fetchStats();
		} catch (error) {
			console.error('Error generating QR codes:', error);
			Alert.alert('Error', 'Failed to generate QR codes');
		} finally {
			setGenerating(false);
		}
	};

	const downloadQRCodePage = async (page: number) => {
		try {
			const response = await axios.get(`${BASE_URL}/api/admin/qr-codes/print?page=${page}`);
			// In a real implementation, you would generate a PDF or image file
			// For now, we'll just show the data
			console.log('QR Code Page Data:', response.data);
			Alert.alert('Download', `QR codes for page ${page} are ready for printing`);
		} catch (error) {
			console.error('Error downloading QR codes:', error);
			Alert.alert('Error', 'Failed to download QR codes');
		}
	};

	const getUsagePercentage = () => {
		if (!stats) {
			return 0;
		}
		return Math.round((stats.used_codes / stats.total_codes) * 100);
	};

	return (
		<ScrollView className="flex-1 bg-background-700">
			<View className="p-4">
				<Heading size="2xl" className="text-typography-950 mb-6">
					{i18n.t('admin.qrCodes.title')}
				</Heading>

				{/* Statistics Cards */}
				<VStack space="md" className="mb-6">
					<Box className="bg-primary-100 p-4 rounded-lg">
						<VStack space="sm">
							<Center className="flex-row items-center">
								<BarChart3 size={24} color={themeTextColor} />
								<Heading size="lg" className="text-typography-950 ml-2">
									{i18n.t('admin.qrCodes.usageStatistics')}
								</Heading>
							</Center>
							{stats ? (
								<VStack space="xs">
									<Text className="text-typography-950">
										{i18n.t('admin.qrCodes.totalCodes')}: {stats.total_codes.toLocaleString()}
									</Text>
									<Text className="text-typography-950">
										{i18n.t('admin.qrCodes.usedCodes')}: {stats.used_codes.toLocaleString()}
									</Text>
									<Text className="text-typography-950">
										{i18n.t('admin.qrCodes.unusedCodes')}: {stats.unused_codes.toLocaleString()}
									</Text>
									<Text className="text-typography-950">
										{i18n.t('admin.qrCodes.usageRate')}: {getUsagePercentage()}%
									</Text>
								</VStack>
							) : (
								<Text className="text-typography-950">
									{loading ? i18n.t('general.loading') : i18n.t('general.noDataAvailable')}
								</Text>
							)}
						</VStack>
					</Box>
				</VStack>

				{/* Action Buttons */}
				<VStack space="md" className="mb-6">
					<Button onPress={generateQRCodes} disabled={generating} size="lg" className="rounded-xl">
						<QrCode size={20} />
						<ButtonText>{generating ? i18n.t('general.generating') : i18n.t('admin.qrCodes.generate10000')}</ButtonText>
					</Button>

					<Button onPress={fetchStats} disabled={loading} variant="outline" size="lg" className="rounded-xl">
						<RefreshCw size={20} />
						<ButtonText>
							{loading ? i18n.t('general.refreshing') : i18n.t('admin.qrCodes.refreshStatistics')}
						</ButtonText>
					</Button>
				</VStack>

				{/* Print Pages */}
				{stats && stats.total_codes > 0 && (
					<VStack space="md">
						<Heading size="lg" className="text-typography-950">
							{i18n.t('admin.qrCodes.printQrCodePages')}
						</Heading>
						<Text className="text-typography-950 mb-4">{i18n.t('admin.qrCodes.eachPageContains50')}</Text>

						<VStack space="sm">
							{Array.from({ length: Math.ceil(stats.total_codes / 50) }, (_, i) => i + 1).map((page) => (
								<Button
									key={page}
									onPress={() => downloadQRCodePage(page)}
									variant="outline"
									size="md"
									className="rounded-lg"
								>
									<Download size={16} />
									<ButtonText>{i18n.t('admin.qrCodes.downloadPage', { page })}</ButtonText>
								</Button>
							))}
						</VStack>
					</VStack>
				)}

				{/* Instructions */}
				<Box className="bg-secondary-100 p-4 rounded-lg mt-6">
					<VStack space="sm">
						<Heading size="md" className="text-typography-950">
							{i18n.t('admin.qrCodes.instructions')}
						</Heading>
						<Text className="text-typography-950 text-sm">{i18n.t('admin.qrCodes.instruction1')}</Text>
						<Text className="text-typography-950 text-sm">{i18n.t('admin.qrCodes.instruction2')}</Text>
						<Text className="text-typography-950 text-sm">{i18n.t('admin.qrCodes.instruction3')}</Text>
						<Text className="text-typography-950 text-sm">{i18n.t('admin.qrCodes.instruction4')}</Text>
						<Text className="text-typography-950 text-sm">{i18n.t('admin.qrCodes.instruction5')}</Text>
					</VStack>
				</Box>
			</View>
		</ScrollView>
	);
}
