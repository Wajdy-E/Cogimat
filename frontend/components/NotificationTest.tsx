import React from "react";
import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import * as Notifications from "expo-notifications";
import backgroundNotificationService from "../lib/backgroundNotificationService";
import { setupNotifications, scheduleTestNotification } from "../lib/notificationSetup";

export default function NotificationTest() {
	const testNotification = async () => {
		try {
			await setupNotifications();
			await scheduleTestNotification();
		} catch (error) {
			console.error("Error scheduling test notification:", error);
		}
	};

	const testWeeklyGoal = async () => {
		try {
			await backgroundNotificationService.saveWeeklyGoal({
				clerk_id: "test-user",
				selected_days: ["monday", "wednesday", "friday"],
				reminder_time: "09:00:00",
			});
			console.log("Weekly goal notification scheduled");
		} catch (error) {
			console.error("Error scheduling weekly goal notification:", error);
		}
	};

	const getScheduledNotifications = async () => {
		try {
			const notifications = await Notifications.getAllScheduledNotificationsAsync();
			console.log("Scheduled notifications:", notifications);
		} catch (error) {
			console.error("Error getting scheduled notifications:", error);
		}
	};

	const cancelAllNotifications = async () => {
		try {
			await Notifications.cancelAllScheduledNotificationsAsync();
			console.log("All notifications cancelled");
		} catch (error) {
			console.error("Error cancelling notifications:", error);
		}
	};

	return (
		<View className="p-4">
			<VStack space="md">
				<Heading size="lg">Notification Test</Heading>

				<Button onPress={testNotification}>
					<ButtonText>Test Notification (5s)</ButtonText>
				</Button>

				<Button onPress={testWeeklyGoal}>
					<ButtonText>Test Weekly Goal</ButtonText>
				</Button>

				<Button onPress={getScheduledNotifications}>
					<ButtonText>Get Scheduled Notifications</ButtonText>
				</Button>

				<Button onPress={cancelAllNotifications}>
					<ButtonText>Cancel All Notifications</ButtonText>
				</Button>
			</VStack>
		</View>
	);
}
