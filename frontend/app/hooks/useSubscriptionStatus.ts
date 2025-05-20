import { useState, useEffect } from "react";
import Purchases, { PurchasesEntitlementInfo } from "react-native-purchases";

interface SubscriptionStatus {
	isSubscribed: boolean;
	isMonthly: boolean;
	isYearly: boolean;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useSubscriptionStatus(): SubscriptionStatus {
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isMonthly, setIsMonthly] = useState(false);
	const [isYearly, setIsYearly] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const checkSubscriptionStatus = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const info = await Purchases.getCustomerInfo();
			// console.log(info, "info");
			const activeEntitlement = info.entitlements.active["Pro"];
			// console.log(activeEntitlement, "activeEntitlement");

			setIsSubscribed(activeEntitlement != null);

			if (activeEntitlement) {
				// Check the product identifier to determine subscription type
				const productId = activeEntitlement.productIdentifier;
				setIsMonthly(productId === "com.cogipro.cogimat.Monthly");
				setIsYearly(productId === "com.cogipro.cogimat.Annual");
			} else {
				setIsMonthly(false);
				setIsYearly(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to check subscription status"));
			setIsSubscribed(false);
			setIsMonthly(false);
			setIsYearly(false);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkSubscriptionStatus();

		// Set up listener for subscription changes
		const customerInfoUpdateListener = () => {
			checkSubscriptionStatus();
		};

		Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

		return () => {
			// Clean up listener on unmount
			Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
		};
	}, []);

	return {
		isSubscribed,
		isMonthly,
		isYearly,
		isLoading,
		error,
		refetch: checkSubscriptionStatus,
	};
}
