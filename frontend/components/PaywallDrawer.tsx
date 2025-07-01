import React, { useState, useEffect } from 'react';
import {
	Drawer,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerCloseButton,
} from '../app/components/ui/drawer';
import { Button, ButtonText } from '../app/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon, CloseIcon, CheckIcon } from '@/components/ui/icon';
import { i18n } from '../i18n';
import { Image, ScrollView, View } from 'react-native';
import { AppDispatch } from '../store/store';
import { useDispatch } from 'react-redux';
import Purchases from 'react-native-purchases';
import { updateSubscriptionStatus } from '../store/auth/authSaga';
import { Star } from 'lucide-react-native';

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

function PaywallDrawer ({ isOpen, onClose }: PaywallDrawerProps) {
	const dispatch: AppDispatch = useDispatch();
	const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
	const [isLoading, setIsLoading] = useState(false);
	const [plans, setPlans] = useState<Record<string, PlanOption>>({
		monthly: {
			id: '$rc_monthly',
			title: i18n.t('paywall.pricing.monthly'),
			price: i18n.t('paywall.pricing.monthlyPrice'),
		},
		annual: {
			id: '$rc_annual',
			title: i18n.t('paywall.pricing.annual'),
			price: i18n.t('paywall.pricing.annualPrice'),
			saving: i18n.t('paywall.pricing.annualSaving'),
			monthlyPrice: i18n.t('paywall.pricing.monthlyPrice'),
		},
	});

	const features = i18n.t('paywall.features.list') as string[];

	// Fetch pricing from RevenueCat
	useEffect(() => {
		const fetchPricing = async () => {
			try {
				const offerings = await Purchases.getOfferings();
				const currentOffering = offerings.current;

				if (currentOffering) {
					const monthlyPackage = currentOffering.availablePackages.find((p) => p.identifier === '$rc_monthly');
					const annualPackage = currentOffering.availablePackages.find((p) => p.identifier === '$rc_annual');

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
							saving: savingsPercent > 0 ? `Save ${savingsPercent.toFixed(0)}%` : '',
							package: annualPackage,
						};
					}

					setPlans(updatedPlans);
				}
			} catch (error) {
				console.error('Error fetching pricing:', error);
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
						isMonthly: selectedPlan === 'monthly',
						isYearly: selectedPlan === 'annual',
					}),
				).unwrap();
				onClose();
			}
		} catch (error) {
			console.error('Error in handleSubscribe:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRestore = async () => {
		try {
			setIsLoading(true);
			const info = await Purchases.restorePurchases();
			const hasActiveSubscription = info.entitlements.active['Pro'] !== null;

			if (hasActiveSubscription) {
				const productId = info.entitlements.active['Pro'].productIdentifier;
				await dispatch(
					updateSubscriptionStatus({
						isSubscribed: true,
						isMonthly: productId === 'com.cogipro.cogimat.Monthly',
						isYearly: productId === 'com.cogipro.cogimat.Annual',
					}),
				).unwrap();
			}
			onClose();
		} catch (error) {
			console.error('Error restoring purchases:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Drawer isOpen={isOpen} onClose={onClose} size="full" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-background-900 rounded-t-3xl flex-1 p-0">
				<DrawerHeader className="mt-10 px-7 py-4">
					<View className="relative w-full">
						{/* <Heading size="xl" className="text-center">
							{i18n.t("paywall.title")}
						</Heading> */}
						{/* <View className="absolute right-0 top-0"> */}
						<DrawerCloseButton onPress={onClose}>
							<Icon as={CloseIcon} size="xl" />
						</DrawerCloseButton>
						{/* </View> */}
					</View>
				</DrawerHeader>

				<ScrollView contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
					<Image
						source={{
							uri: 'https://dti1eh5sohakbabs.public.blob.vercel-storage.com/exercise-media/images/paywallimage-ICy6yLTw2lKXHrsmiSAsEgIQiLX1FA',
						}}
						className="w-full h-[300px]"
						resizeMode="cover"
					/>
					<DrawerBody className="px-7">
						{/* <Text className="text-lg text-center mb-6">{i18n.t("paywall.subtitle")}</Text> */}

						<View className="mb-6 flex items-center">
							<View className="flex flex-row items-center gap-2 mb-6">
								<Icon as={Star} size="xl" className="text-primary-500 fill-primary-500" fill="currentColor" />
								<Text className="text-3xl font-bold text-primary-500">{i18n.t('paywall.title')}</Text>
							</View>
							<View className="flex flex-col text-start">
								{features.map((feature: string, index: number) => (
									<View key={index} className="flex-row items-center mb-3">
										<Icon as={CheckIcon} size="sm" className="mr-2" />
										<Text>{feature}</Text>
									</View>
								))}
							</View>
						</View>

						<View className="flex justify-between gap-4 mb-6 w-full">
							<Button
								onPress={() => setSelectedPlan('monthly')}
								className="fw-full lex-1 flex justify-between rounded-md h-[70px]"
								variant="outline"
								action={selectedPlan === 'monthly' ? 'primary' : 'secondary'}
							>
								<Text className="font-semibold">{plans.monthly.title}</Text>
								<Text className="text-lg">{plans.monthly.price}</Text>
							</Button>
							<Button
								onPress={() => setSelectedPlan('annual')}
								className="flex-1 flex-col rounded-md h-[70px]"
								variant="outline"
								action={selectedPlan === 'annual' ? 'primary' : 'secondary'}
							>
								<View className="w-full flex flex-row justify-between">
									<Text className="text-lg font-bold">{plans.annual.title}</Text>
									<Text className="text-lg font-bold">{plans.annual.price}</Text>
								</View>

								{plans.annual.saving && (
									<View className="w-full flex flex-row justify-between">
										<Text className="text-sm">{plans.annual.saving}</Text>
										<Text className="text-sm">{plans.annual.monthlyPrice}</Text>
									</View>
								)}
							</Button>
						</View>
					</DrawerBody>
				</ScrollView>

				<DrawerFooter className="gap-4 flex-col px-7 pb-5">
					<Button onPress={handleSubscribe} isDisabled={isLoading} className="w-full h-[50px] rounded-xl">
						<ButtonText>{i18n.t('paywall.buttons.subscribe')}</ButtonText>
					</Button>
					<Button variant="link" onPress={handleRestore} isDisabled={isLoading} className="w-full">
						<ButtonText>{i18n.t('paywall.buttons.restore')}</ButtonText>
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default PaywallDrawer;
