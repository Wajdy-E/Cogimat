import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { i18n } from "../i18n";

// Configure notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export interface WeeklyGoalNotification {
	clerk_id: string;
	selected_days: string[];
	reminder_time: string; // HH:MM:SS format
}

export class NotificationService {
	private static instance: NotificationService;
	private notificationIds: Set<string> = new Set();

	private constructor() {}

	static getInstance(): NotificationService {
		if (!NotificationService.instance) {
			NotificationService.instance = new NotificationService();
		}
		return NotificationService.instance;
	}

	async requestPermissions(): Promise<boolean> {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	}

	async checkPermissions(): Promise<boolean> {
		const { status } = await Notifications.getPermissionsAsync();
		return status === "granted";
	}

	async scheduleWeeklyWorkoutNotifications(goal: WeeklyGoalNotification): Promise<void> {
		// Cancel existing notifications for this user
		await this.cancelUserNotifications(goal.clerk_id);

		const hasPermission = await this.checkPermissions();
		if (!hasPermission) {
			console.log("Notification permissions not granted");
			return;
		}

		const [hours, minutes] = goal.reminder_time.split(":").map(Number);

		// Schedule notifications for each selected day
		for (const day of goal.selected_days) {
			const notificationId = await this.scheduleNotificationForDay(day, hours, minutes, goal.clerk_id);
			if (notificationId) {
				this.notificationIds.add(notificationId);
			}
		}
	}

	private async scheduleNotificationForDay(
		day: string,
		hours: number,
		minutes: number,
		clerkId: string
	): Promise<string | null> {
		try {
			const dayIndex = this.getDayIndex(day);
			if (dayIndex === -1) return null;

			const now = new Date();
			const scheduledTime = new Date();
			scheduledTime.setHours(hours, minutes, 0, 0);

			// Set to the next occurrence of this day
			const daysUntilNext = (dayIndex - scheduledTime.getDay() + 7) % 7;
			scheduledTime.setDate(scheduledTime.getDate() + daysUntilNext);

			// If the time has already passed today, schedule for next week
			if (scheduledTime <= now) {
				scheduledTime.setDate(scheduledTime.getDate() + 7);
			}

			// Calculate seconds until the scheduled time
			const secondsUntilScheduled = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

			if (secondsUntilScheduled <= 0) {
				console.log(`Skipping notification for ${day} - time has passed`);
				return null;
			}

			const notificationId = await Notifications.scheduleNotificationAsync({
				content: {
					title: i18n.t("notifications.workoutReminder.title"),
					body: i18n.t("notifications.workoutReminder.body"),
					data: {
						type: "weekly_workout",
						clerk_id: clerkId,
						day: day,
					},
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
					seconds: secondsUntilScheduled,
				},
			});

			console.log(`Scheduled notification for ${day} at ${hours}:${minutes}`, notificationId);
			return notificationId;
		} catch (error) {
			console.error("Error scheduling notification:", error);
			return null;
		}
	}

	private getDayIndex(day: string): number {
		const dayMap: { [key: string]: number } = {
			sunday: 0,
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
		};
		return dayMap[day.toLowerCase()] ?? -1;
	}

	async cancelUserNotifications(clerkId: string): Promise<void> {
		try {
			const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

			for (const notification of scheduledNotifications) {
				if (notification.content.data?.clerk_id === clerkId) {
					await Notifications.cancelScheduledNotificationAsync(notification.identifier);
					this.notificationIds.delete(notification.identifier);
				}
			}
		} catch (error) {
			console.error("Error canceling user notifications:", error);
		}
	}

	async cancelAllNotifications(): Promise<void> {
		try {
			await Notifications.cancelAllScheduledNotificationsAsync();
			this.notificationIds.clear();
		} catch (error) {
			console.error("Error canceling all notifications:", error);
		}
	}

	async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
		try {
			return await Notifications.getAllScheduledNotificationsAsync();
		} catch (error) {
			console.error("Error getting scheduled notifications:", error);
			return [];
		}
	}

	// Method to handle notification received while app is in foreground
	addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
		return Notifications.addNotificationReceivedListener(listener);
	}

	// Method to handle notification response (when user taps notification)
	addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
		return Notifications.addNotificationResponseReceivedListener(listener);
	}
}

export default NotificationService.getInstance();
