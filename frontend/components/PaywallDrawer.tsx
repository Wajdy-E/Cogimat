import React, { useState } from "react";
import {
	Drawer,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerCloseButton,
} from "../app/components/ui/drawer";
import { Button, ButtonText } from "../app/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Icon, CloseIcon, CheckIcon } from "@/components/ui/icon";
import { i18n } from "../i18n";
import { Image, ScrollView, View, Pressable } from "react-native";
import { AppDispatch } from "../store/store";
import { useDispatch } from "react-redux";
import Purchases from "react-native-purchases";
import { updateSubscriptionStatus } from "../store/auth/authSaga";

interface PaywallDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

interface PlanOption {
	id: string;
	title: string;
	price: string;
	saving?: string;
}

function PaywallDrawer({ isOpen, onClose }: PaywallDrawerProps) {
	const dispatch: AppDispatch = useDispatch();
	const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
	const [isLoading, setIsLoading] = useState(false);

	const plans: Record<string, PlanOption> = {
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
		},
	};

	const features = i18n.t("paywall.features.list") as string[];

	const handleSubscribe = async () => {
		try {
			setIsLoading(true);
			const offerings = await Purchases.getOfferings();
			const selectedPackage = offerings.current?.availablePackages.find((p) => p.identifier === plans[selectedPlan].id);

			if (selectedPackage) {
				await Purchases.purchasePackage(selectedPackage);
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
			const hasActiveSubscription = info.entitlements.active["Pro"] != null;

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
		<Drawer isOpen={isOpen} onClose={onClose} size="lg" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-background-0 rounded-t-3xl flex-1">
				<DrawerHeader>
					<View className="relative w-full">
						<Heading size="xl" className="text-center">
							{i18n.t("paywall.title")}
						</Heading>
						<View className="absolute right-0 top-0">
							<DrawerCloseButton onPress={onClose}>
								<Icon as={CloseIcon} size="md" />
							</DrawerCloseButton>
						</View>
					</View>
				</DrawerHeader>

				<ScrollView contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
					<DrawerBody>
						<View className="mb-6">
							<Image
								source={require("../assets/exercise-thumbnails/placeholder.png")}
								className="w-full h-40 rounded-lg"
								resizeMode="cover"
							/>
						</View>

						<Text className="text-lg text-center mb-6">{i18n.t("paywall.subtitle")}</Text>

						<View className="mb-6">
							<Text className="text-lg font-semibold mb-4">{i18n.t("paywall.features.title")}</Text>
							{features.map((feature: string, index: number) => (
								<View key={index} className="flex-row items-center mb-3">
									<Icon as={CheckIcon} size="sm" className="text-primary mr-2" />
									<Text>{feature}</Text>
								</View>
							))}
						</View>

						<View className="flex-row justify-between gap-4 mb-6 w-full">
							{Object.entries(plans).map(([key, plan]) => (
								<Button
									key={key}
									onPress={() => setSelectedPlan(key as "monthly" | "annual")}
									className="flex-1 flex-col rounded-md h-30 min-w-[45%]"
									variant={selectedPlan === key ? "solid" : "outline"}
									action={selectedPlan === key ? "primary" : "secondary"}
								>
									<ButtonText className="font-semibold">{plan.title}</ButtonText>
									<ButtonText className="text-lg">{plan.price}</ButtonText>
									{plan.saving && <ButtonText className="text-sm text-primary">{plan.saving}</ButtonText>}
								</Button>
							))}
						</View>
					</DrawerBody>
				</ScrollView>

				<DrawerFooter className="gap-4 flex-col">
					<Button onPress={handleSubscribe} isDisabled={isLoading} className="w-full">
						<ButtonText>{i18n.t("paywall.buttons.subscribe")}</ButtonText>
					</Button>
					<Button variant="link" onPress={handleRestore} isDisabled={isLoading} className="w-full">
						<ButtonText>{i18n.t("paywall.buttons.restore")}</ButtonText>
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default PaywallDrawer;
