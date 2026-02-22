import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert, Share, Platform } from "react-native";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	FormControlHelper,
	FormControlHelperText,
} from "@/components/ui/form-control";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableData } from "@/components/ui/table";
import { i18n } from "../../i18n";
import { useTheme } from "@/components/ui/ThemeProvider";
import { QrCode, Download, RefreshCw, BarChart3 } from "lucide-react-native";
import axios from "axios";
import { Paths, File } from "expo-file-system";

const CODES_PER_PAGE = 50;
const MIN_PAGES = 1;
const MAX_PAGES = 200; // 200 * 50 = 10,000

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

export default function QRCodesManagement() {
	const [stats, setStats] = useState<QRCodeStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [pagesToGenerate, setPagesToGenerate] = useState(MIN_PAGES);
	const { themeTextColor } = useTheme();

	const getUsagePercentage = () => {
		if (!stats) return 0;
		return Math.round((stats.used_codes / stats.total_codes) * 100);
	};

	const statsTableRows = stats
		? [
				{ metric: i18n.t("admin.qrCodes.totalCodes"), value: stats.total_codes.toLocaleString() },
				{ metric: i18n.t("admin.qrCodes.usedCodes"), value: stats.used_codes.toLocaleString() },
				{ metric: i18n.t("admin.qrCodes.unusedCodes"), value: stats.unused_codes.toLocaleString() },
				{ metric: i18n.t("admin.qrCodes.usageRate"), value: `${getUsagePercentage()}%` },
			]
		: [];
	const totalPages = stats ? Math.ceil(stats.total_codes / CODES_PER_PAGE) : 0;

	const countToGenerate = Math.min(
		MAX_PAGES * CODES_PER_PAGE,
		Math.max(MIN_PAGES * CODES_PER_PAGE, pagesToGenerate * CODES_PER_PAGE),
	);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${BASE_URL}/api/admin/qr-codes`);
			setStats(response.data.statistics);
		} catch (error) {
			console.error("Error fetching QR code stats:", error);
			Alert.alert(i18n.t("admin.qrCodes.alerts.error"), i18n.t("admin.qrCodes.alerts.fetchError"));
		} finally {
			setLoading(false);
		}
	};

	const generateQRCodes = async () => {
		const count = Math.min(10000, Math.max(CODES_PER_PAGE, pagesToGenerate * CODES_PER_PAGE));
		try {
			setGenerating(true);
			await axios.post(`${BASE_URL}/api/admin/qr-codes`, {
				count,
				batchSize: CODES_PER_PAGE,
			});
			Alert.alert(
				i18n.t("admin.qrCodes.alerts.success"),
				i18n.t("admin.qrCodes.alerts.generateSuccessCount", { count: count.toLocaleString() } as any),
			);
			fetchStats();
		} catch (error) {
			console.error("Error generating QR codes:", error);
			Alert.alert(i18n.t("admin.qrCodes.alerts.error"), i18n.t("admin.qrCodes.alerts.generateError"));
		} finally {
			setGenerating(false);
		}
	};

	const downloadQRCodePage = async (page: number) => {
		try {
			const url = `${BASE_URL}/api/admin/qr-codes/print?page=${page}&format=pdf`;
			const response = await fetch(url, { method: "GET" });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const arrayBuffer = await response.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			const filename = `qr-codes-page-${String(page).padStart(3, "0")}.pdf`;
			const file = Paths.cache.createFile(filename, "application/pdf");
			file.write(bytes);
			const shareUrl = Platform.OS === "android" && file.contentUri ? file.contentUri : file.uri;
			await Share.share({
				url: shareUrl,
				title: i18n.t("admin.qrCodes.downloadReady", { page }),
				message: i18n.t("admin.qrCodes.downloadReady", { page }),
			});
		} catch (error) {
			console.error("Error downloading QR codes:", error);
			Alert.alert(i18n.t("admin.qrCodes.alerts.error"), i18n.t("admin.qrCodes.alerts.downloadError"));
		}
	};

	return (
		<ScrollView className="flex-1 bg-background-700">
			<View className="p-4">
				<Heading size="2xl" className="text-typography-950 mb-6">
					{i18n.t("admin.qrCodes.title")}
				</Heading>

				{/* Usage statistics table */}
				<VStack space="md" className="mb-6">
					<View className="flex-row items-center gap-2 mb-2">
						<BarChart3 size={22} color={themeTextColor} />
						<Heading size="lg" className="text-typography-950">
							{i18n.t("admin.qrCodes.usageStatistics")}
						</Heading>
					</View>
					<Box className="rounded-xl overflow-hidden border border-outline-200 bg-secondary-500">
						{loading ? (
							<View className="p-6">
								<Text className="text-typography-700">{i18n.t("general.loading")}</Text>
							</View>
						) : statsTableRows.length === 0 ? (
							<View className="p-6">
								<Text className="text-typography-700">{i18n.t("general.noDataAvailable")}</Text>
							</View>
						) : (
							<Table className="w-full">
								<TableHeader>
									<TableRow className="bg-secondary-600 border-b border-outline-300">
										<TableHead className="text-typography-950 font-semibold px-4 py-3">
											{i18n.t("admin.qrCodes.tableMetric")}
										</TableHead>
										<TableHead className="text-typography-950 font-semibold px-4 py-3 text-right">
											{i18n.t("admin.qrCodes.tableValue")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{statsTableRows.map((row, idx) => (
										<TableRow key={idx} className="border-b border-outline-200 last:border-b-0">
											<TableData className="text-typography-800 px-4 py-3">{row.metric}</TableData>
											<TableData className="text-typography-950 font-medium px-4 py-3 text-right">
												{row.value}
											</TableData>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</Box>
				</VStack>

				{/* Generate: pages selector + button */}
				<VStack space="md" className="mb-6">
					<Box className="bg-secondary-500 border border-outline-200 p-4 rounded-xl">
						<VStack space="sm">
							<FormControl>
								<FormControlLabel>
									<FormControlLabelText>{i18n.t("admin.qrCodes.pagesToGenerate")}</FormControlLabelText>
								</FormControlLabel>
								<Input size="md">
									<InputField
										keyboardType="number-pad"
										value={String(pagesToGenerate)}
										onChangeText={(t) => {
											const n = parseInt(t, 10);
											if (!Number.isNaN(n)) setPagesToGenerate(Math.min(MAX_PAGES, Math.max(MIN_PAGES, n)));
											else if (t === "") setPagesToGenerate(MIN_PAGES);
										}}
										placeholder={`${MIN_PAGES}-${MAX_PAGES}`}
									/>
								</Input>
								<FormControlHelper>
									<FormControlHelperText>
										{i18n.t("admin.qrCodes.pagesToGenerateHelper", {
											min: MIN_PAGES,
											max: MAX_PAGES,
											minCodes: MIN_PAGES * CODES_PER_PAGE,
											maxCodes: MAX_PAGES * CODES_PER_PAGE,
										})}
									</FormControlHelperText>
								</FormControlHelper>
							</FormControl>
							<Button onPress={generateQRCodes} disabled={generating} size="lg" className="rounded-xl">
								<QrCode size={20} />
								<ButtonText>
									{generating
										? i18n.t("general.generating")
										: i18n.t("admin.qrCodes.generateCountButton", { count: countToGenerate.toLocaleString() } as any)}
								</ButtonText>
							</Button>
						</VStack>
					</Box>

					<Button onPress={fetchStats} disabled={loading} variant="outline" size="lg" className="rounded-xl">
						<RefreshCw size={20} color={themeTextColor} />
						<ButtonText>
							{loading ? i18n.t("general.refreshing") : i18n.t("admin.qrCodes.refreshStatistics")}
						</ButtonText>
					</Button>
				</VStack>

				{/* Print / Download pages table */}
				{stats && stats.total_codes > 0 && totalPages > 0 && (
					<VStack space="md" className="mb-6">
						<Heading size="lg" className="text-typography-950">
							{i18n.t("admin.qrCodes.printQrCodePages")}
						</Heading>
						<Text className="text-typography-600 mb-3">{i18n.t("admin.qrCodes.eachPageContains50")}</Text>
						<Box className="rounded-xl overflow-hidden border border-outline-200 bg-secondary-500">
							<Table className="w-full">
								<TableHeader>
									<TableRow className="bg-secondary-600 border-b border-outline-300">
										<TableHead className="text-typography-950 font-semibold px-4 py-3">
											{i18n.t("admin.qrCodes.tablePage")}
										</TableHead>
										<TableHead className="text-typography-950 font-semibold px-4 py-3">
											{i18n.t("admin.qrCodes.tableRange")}
										</TableHead>
										<TableHead className="text-typography-950 font-semibold px-4 py-3 text-right">
											{i18n.t("admin.qrCodes.tableAction")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
										const start = (page - 1) * CODES_PER_PAGE + 1;
										const end = page * CODES_PER_PAGE;
										return (
											<TableRow key={page} className="border-b border-outline-200 last:border-b-0">
												<TableData className="text-typography-800 px-4 py-2.5">{page}</TableData>
												<TableData className="text-typography-700 px-4 py-2.5">
													{start} – {end}
												</TableData>
												<TableData className="px-4 py-2.5 text-right">
													<Button
														onPress={() => downloadQRCodePage(page)}
														variant="outline"
														size="sm"
														className="rounded-lg"
													>
														<ButtonIcon as={Download} size="sm" />
														<ButtonText>{i18n.t("admin.qrCodes.download")}</ButtonText>
													</Button>
												</TableData>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</Box>
					</VStack>
				)}

				{/* Instructions */}
				<Box className="bg-secondary-500 border border-outline-200 p-4 rounded-xl mt-2">
					<VStack space="sm">
						<Heading size="md" className="text-typography-950">
							{i18n.t("admin.qrCodes.instructions")}
						</Heading>
						<Text className="text-typography-700 text-sm">{i18n.t("admin.qrCodes.instruction1")}</Text>
						<Text className="text-typography-700 text-sm">{i18n.t("admin.qrCodes.instruction2")}</Text>
						<Text className="text-typography-700 text-sm">{i18n.t("admin.qrCodes.instruction3")}</Text>
						<Text className="text-typography-700 text-sm">{i18n.t("admin.qrCodes.instruction4")}</Text>
						<Text className="text-typography-700 text-sm">{i18n.t("admin.qrCodes.instruction5")}</Text>
					</VStack>
				</Box>
			</View>
		</ScrollView>
	);
}
