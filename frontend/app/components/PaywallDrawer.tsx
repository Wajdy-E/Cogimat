import React, { useState, useEffect } from "react";
import {
	Drawer,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
} from "@/components/ui/drawer";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Icon, CloseIcon, CheckCircleIcon } from "@/components/ui/icon";
import { i18n } from "../i18n";
import { ScrollView, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import Purchases from "react-native-purchases";
import { updateSubscriptionStatus } from "@/store/auth/authSaga";
import { Star, Crown, Lock, Zap, TrendingUp, Users } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PaywallDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

interface PlanOption {
	id: string;
	title: string;
	price: string;
	saving?: string;
	monthlyPrice?: string;
	package?: any; // RevenueCat package
}

function PaywallDrawer({ isOpen, onClose }: PaywallDrawerProps) {
	const dispatch: AppDispatch = useDispatch();
	const insets = useSafeAreaInsets();
	const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
	const [isLoading, setIsLoading] = useState(false);
	const [plans, setPlans] = useState<Record<string, PlanOption>>({
		monthly: {
			id: "$rc_monthly",
			title: i18n.t("paywall.pricing.monthly"),
			price: i18n.t("paywall.pricing.monthlyPrice"),
		},
		annual: {
			id: "$rc_annual",
			title: i18n.t("paywall.pricing.annual"),
			price: i18n.t("paywall.pricing.annualPrice"),
			saving: i18n.t("paywall.pricing.annualSaving"),
			monthlyPrice: i18n.t("paywall.pricing.monthlyPrice"),
		},
	});

	const features = i18n.t("paywall.features.list") as string[];
	
	// Feature icons mapping
	const featureIcons = [
		{ icon: Lock, color: "#60A5FA" }, // Light blue
		{ icon: Zap, color: "#60A5FA" },
		{ icon: TrendingUp, color: "#60A5FA" },
		{ icon: Users, color: "#60A5FA" },
	];

	// Fetch pricing from RevenueCat
	useEffect(() => {
		const fetchPricing = async () => {
			try {
				const offerings = await Purchases.getOfferings();
				const currentOffering = offerings.current;

				if (currentOffering) {
					const monthlyPackage = currentOffering.availablePackages.find((p) => p.identifier === "$rc_monthly");
					const annualPackage = currentOffering.availablePackages.find((p) => p.identifier === "$rc_annual");

					const updatedPlans = { ...plans };

					if (monthlyPackage) {
						updatedPlans.monthly = {
							...updatedPlans.monthly,
							price: monthlyPackage.product.priceString,
							package: monthlyPackage,
						};
					}

					if (annualPackage) {
						// Calculate savings
						const annualPrice = Number(annualPackage.product.price);
						const monthlyPrice = monthlyPackage ? Number(monthlyPackage.product.price) : 0;
						const savingsPercent =
							monthlyPrice > 0 ? ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100 : 0;

						updatedPlans.annual = {
							...updatedPlans.annual,
							price: annualPackage.product.priceString,
							saving: savingsPercent > 0 ? `Save ${savingsPercent.toFixed(0)}%` : "",
							package: annualPackage,
						};
					}

					setPlans(updatedPlans);
				}
			} catch (error) {
				console.error("Error fetching pricing:", error);
			}
		};

		if (isOpen) {
			fetchPricing();
		}
	}, [isOpen]);

	const handleSubscribe = async () => {
		try {
			setIsLoading(true);
			const selectedPlanData = plans[selectedPlan];

			if (selectedPlanData.package) {
				await Purchases.purchasePackage(selectedPlanData.package);
				// Update subscription status in Redux and database
				await dispatch(
					updateSubscriptionStatus({
						isSubscribed: true,
						isMonthly: selectedPlan === "monthly",
						isYearly: selectedPlan === "annual",
					})
				).unwrap();
				onClose();
			}
		} catch (error) {
			console.error("Error in handleSubscribe:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRestore = async () => {
		try {
			setIsLoading(true);
			const info = await Purchases.restorePurchases();
			const hasActiveSubscription = info.entitlements.active["Pro"] !== null;

			if (hasActiveSubscription) {
				const productId = info.entitlements.active["Pro"].productIdentifier;
				await dispatch(
					updateSubscriptionStatus({
						isSubscribed: true,
						isMonthly: productId === "com.cogipro.cogimat.Monthly",
						isYearly: productId === "com.cogipro.cogimat.Annual",
					})
				).unwrap();
			}
			onClose();
		} catch (error) {
			console.error("Error restoring purchases:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Drawer isOpen={isOpen} onClose={onClose} size="full" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-white rounded-t-3xl flex-1 p-0 overflow-hidden">
				{/* Purple Header Section with Safe Area */}
				<DrawerHeader className="p-0">
					<LinearGradient
						colors={['#9333EA', '#7C3AED', '#6D28D9']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={{
							paddingTop: insets.top + 16,
							paddingBottom: 32,
							paddingHorizontal: 28,
							position: 'relative',
							width: '100%'
						}}
					>
						{/* Decorative Stars */}
						<View style={{ position: 'absolute', top: insets.top + 16, left: 39 }}>
							<Icon as={Star} size="sm" className="text-purple-300" style={{ color: '#C4B5FD' }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 24, right: 60 }}>
							<Icon as={Star} size="sm" className="text-purple-300" style={{ color: '#C4B5FD' }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 8, left: '20%' }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.7 }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 12, right: '25%' }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.7 }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 60, left: 20 }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.6 }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 70, right: 30 }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.6 }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 100, left: '15%' }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.5 }} fill="#C4B5FD" />
						</View>
						<View style={{ position: 'absolute', top: insets.top + 110, right: '20%' }}>
							<Icon as={Star} size="xs" className="text-purple-300" style={{ color: '#C4B5FD', opacity: 0.5 }} fill="#C4B5FD" />
						</View>

						{/* Close Button */}
						<View style={{ position: 'absolute', top: insets.top + 16, right: 18, zIndex: 10 }} className="bg-black rounded-full p-2">
							<Pressable onPress={onClose}>
								<Icon as={CloseIcon} size="xl" className="text-white" />
							</Pressable>
						</View>

						{/* Crown Icon in Circle */}
						<View className="items-center mb-4 mt-2">
							<View 
								className="w-20 h-20 rounded-full items-center justify-center" 
								style={{ 
									backgroundColor: '#A78BFA'
								}}
							>
								<Icon as={Crown} size="xl" style={{ color: '#FCD34D', width: 40, height: 40 }} />
							</View>
						</View>

						{/* Title */}
						<Text className="text-3xl font-bold text-white text-center mb-2">
							{i18n.t("paywall.title")}
						</Text>

						{/* Subtitle */}
						<Text className="text-base text-white text-center opacity-90">
							{i18n.t("paywall.subtitle") || "Unlock your full cognitive potential"}
						</Text>
					</LinearGradient>
				</DrawerHeader>

				<ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

					{/* Features Section */}
					<View className="px-7 py-6 bg-white">
						{features.map((feature: string, index: number) => {
							const FeatureIcon = featureIcons[index]?.icon || Lock;
							const iconColor = featureIcons[index]?.color || "#60A5FA";
							
							return (
								<View key={index} className="flex-row items-center mb-4">
									<View className="mr-3 mt-0.5 bg-primary-100 rounded-full p-2">
										<Icon as={FeatureIcon} size="md" style={{ color: iconColor }} />
									</View>
									<Text className="flex-1 text-base text-gray-800 leading-6">
										{feature}
									</Text>
								</View>
							);
						})}
					</View>

					{/* Pricing Section */}
					<View className="px-7 mb-6">
						{/* Annual Plan - Highlighted */}
						<Pressable
							onPress={() => setSelectedPlan("annual")}
							className="mb-4 rounded-xl overflow-hidden relative"
							style={{
								backgroundColor: selectedPlan === "annual" ? '#06b6d4' : '#E0F2FE', // Teal when selected, light blue when not
								borderWidth: selectedPlan === "annual" ? 0 : 2,
								borderColor: selectedPlan === "annual" ? 'transparent' : '#06b6d4',
								padding: 16,
								minHeight: 90,
							}}
						>
							{/* BEST VALUE Banner */}
							<View className="absolute top-0 left-0 right-0 items-center">
								<View style={{ backgroundColor: '#9CE3EF', paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
									<Text className="text-white text-xs font-bold">{i18n.t("paywall.pricing.bestValue")}</Text>
								</View>
							</View>

							<View className="flex-row justify-between items-center mt-4">
								<View className="flex-1 flex-row items-center">
									{/* Selection Indicator */}
									{selectedPlan === "annual" && (
										<View style={{ marginRight: 8 }}>
											<View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4 }}>
												<Icon as={CheckCircleIcon} size="sm" style={{ color: '#06b6d4' }} />
											</View>
										</View>
									)}
									<View className="flex-1">
										<Text className={`text-lg font-bold mb-1 ${selectedPlan === "annual" ? "text-white" : "text-gray-900"}`}>
											{plans.annual.title}
										</Text>
										{plans.annual.saving && (
											<Text className={`text-sm ${selectedPlan === "annual" ? "text-white opacity-90" : "text-gray-600"}`}>
												{plans.annual.saving}
											</Text>
										)}
									</View>
								</View>
								<View className="items-end">
									<Text className={`text-2xl font-bold ${selectedPlan === "annual" ? "text-white" : "text-gray-900"}`}>
										{plans.annual.price}
									</Text>
									<Text className={`text-sm ${selectedPlan === "annual" ? "text-white opacity-90" : "text-gray-600"}`}>
										per year
									</Text>
								</View>
							</View>
						</Pressable>

						{/* Monthly Plan */}
						<Pressable
							onPress={() => setSelectedPlan("monthly")}
							className="rounded-xl relative"
							style={{
								backgroundColor: selectedPlan === "monthly" ? '#F3E8FF' : '#FFFFFF', // Light purple when selected
								borderWidth: 3,
								borderColor: selectedPlan === "monthly" ? '#9333EA' : '#E5E7EB',
								padding: 16,
								minHeight: 80,
							}}
						>
							<View className="flex-row justify-between items-center">
								<View className="flex-1 flex-row items-center">
									{/* Selection Indicator */}
									{selectedPlan === "monthly" && (
										<View style={{ marginRight: 8 }}>
											<View style={{ backgroundColor: '#9333EA', borderRadius: 12, padding: 4 }}>
												<Icon as={CheckCircleIcon} size="sm" style={{ color: '#FFFFFF' }} />
											</View>
										</View>
									)}
									<View className="flex-1">
										<Text className={`text-lg font-bold mb-1 ${selectedPlan === "monthly" ? "text-gray-900" : "text-gray-900"}`}>
											{plans.monthly.title}
										</Text>
										<Text className={`text-sm ${selectedPlan === "monthly" ? "text-gray-700" : "text-gray-500"}`}>
											Billed monthly
										</Text>
									</View>
								</View>
								<View className="items-end">
									<Text className={`text-2xl font-bold ${selectedPlan === "monthly" ? "text-gray-900" : "text-gray-900"}`}>
										{plans.monthly.price}
									</Text>
									<Text className={`text-sm ${selectedPlan === "monthly" ? "text-gray-700" : "text-gray-500"}`}>
										per month
									</Text>
								</View>
							</View>
						</Pressable>
					</View>

					{/* Footer Text */}
					<Text className="text-center text-gray-500 text-sm px-7 mb-4">
						Cancel anytime. 7-day money-back guarantee.
					</Text>
				</ScrollView>

				{/* Footer Buttons */}
				<View style={{ paddingHorizontal: 28, paddingBottom: Math.max(insets.bottom, 20), paddingTop: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
					<Button 
						onPress={handleSubscribe} 
						isDisabled={isLoading} 
						className="w-full h-[50px] rounded-xl mb-3"
						style={{ backgroundColor: '#9333EA' }}
					>
						<ButtonText className="text-white font-semibold">
							{i18n.t("paywall.buttons.subscribe")}
						</ButtonText>
					</Button>
					<Button 
						variant="link" 
						onPress={handleRestore} 
						isDisabled={isLoading} 
						className="w-full"
					>
						<ButtonText className="text-gray-600">
							{i18n.t("paywall.buttons.restore")}
						</ButtonText>
					</Button>
				</View>
			</DrawerContent>
		</Drawer>
	);
}

export default PaywallDrawer;
