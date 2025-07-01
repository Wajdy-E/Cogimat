import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../i18n';

// Configure notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

const WEEKLY_GOALS_STORAGE_KEY = 'weekly_workout_goals';

export interface WeeklyGoalData {
	clerk_id: string;
	selected_days: string[];
	reminder_time: string; // HH:MM:SS format
	last_scheduled?: string;
}

export class BackgroundNotificationService {
	private static instance: BackgroundNotificationService;

	private constructor () {}

	static getInstance (): BackgroundNotificationService {
		if (!BackgroundNotificationService.instance) {
			BackgroundNotificationService.instance = new BackgroundNotificationService();
		}
		return BackgroundNotificationService.instance;
	}

	async saveWeeklyGoal (goal: WeeklyGoalData): Promise<void> {
		try {
			const existingGoals = await this.getWeeklyGoals();
			const updatedGoals = existingGoals.filter((g) => g.clerk_id !== goal.clerk_id);
			updatedGoals.push(goal);

			await AsyncStorage.setItem(WEEKLY_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
			await this.scheduleNotificationsForGoal(goal);

			// Update the goal with the last scheduled timestamp
			await this.updateGoalLastScheduled(goal.clerk_id, new Date().toISOString());
		} catch (error) {
			console.error('Error saving weekly goal:', error);
		}
	}

	private async updateGoalLastScheduled (clerkId: string, timestamp: string): Promise<void> {
		try {
			const existingGoals = await this.getWeeklyGoals();
			const updatedGoals = existingGoals.map((goal) =>
				goal.clerk_id === clerkId ? { ...goal, last_scheduled: timestamp } : goal,
			);
			await AsyncStorage.setItem(WEEKLY_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
		} catch (error) {
			console.error('Error updating goal last scheduled:', error);
		}
	}

	async getWeeklyGoals (): Promise<WeeklyGoalData[]> {
		try {
			const goalsJson = await AsyncStorage.getItem(WEEKLY_GOALS_STORAGE_KEY);
			return goalsJson ? JSON.parse(goalsJson) : [];
		} catch (error) {
			console.error('Error getting weekly goals:', error);
			return [];
		}
	}

	async removeWeeklyGoal (clerkId: string): Promise<void> {
		try {
			const existingGoals = await this.getWeeklyGoals();
			const updatedGoals = existingGoals.filter((g) => g.clerk_id !== clerkId);
			await AsyncStorage.setItem(WEEKLY_GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
			await this.cancelUserNotifications(clerkId);
		} catch (error) {
			console.error('Error removing weekly goal:', error);
		}
	}

	private async scheduleNotificationsForGoal (goal: WeeklyGoalData): Promise<void> {
		const hasPermission = await this.checkPermissions();
		if (!hasPermission) {
			console.log('Notification permissions not granted');
			return;
		}

		// Cancel existing notifications for this user
		await this.cancelUserNotifications(goal.clerk_id);

		const [hours, minutes] = goal.reminder_time.split(':').map(Number);

		// Schedule notifications for each selected day
		for (const day of goal.selected_days) {
			await this.scheduleNotificationForDay(day, hours, minutes, goal.clerk_id);
		}

		// Update last scheduled timestamp (but don't call saveWeeklyGoal again to avoid infinite loop)
		goal.last_scheduled = new Date().toISOString();
	}

	private async scheduleNotificationForDay (
		day: string,
		hours: number,
		minutes: number,
		clerkId: string,
	): Promise<void> {
		try {
			const dayIndex = this.getDayIndex(day);
			if (dayIndex === -1) {
				console.log(`Invalid day: ${day}`);
				return;
			}

			const now = new Date();

			// Schedule notifications for the next 4 weeks to ensure reliability
			for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
				const scheduledTime = new Date();
				scheduledTime.setHours(hours, minutes, 0, 0);

				// Set to the next occurrence of this day
				const daysUntilNext = (dayIndex - scheduledTime.getDay() + 7) % 7;
				scheduledTime.setDate(scheduledTime.getDate() + daysUntilNext + weekOffset * 7);

				// If the time has already passed today, schedule for next week
				if (scheduledTime <= now) {
					scheduledTime.setDate(scheduledTime.getDate() + 7);
				}

				// Calculate seconds until the scheduled time
				const secondsUntilScheduled = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

				if (secondsUntilScheduled <= 0) {
					console.log(`Skipping notification for ${day} week ${weekOffset + 1} - time has passed`);
					continue;
				}

				console.log(
					`Scheduling notification for ${day} week ${weekOffset + 1} at ${hours}:${minutes} (${secondsUntilScheduled} seconds from now)`,
				);

				await Notifications.scheduleNotificationAsync({
					content: {
						title: i18n.t('notifications.workoutReminder.title'),
						body: i18n.t('notifications.workoutReminder.body'),
						data: {
							type: 'weekly_workout',
							clerk_id: clerkId,
							day: day,
							week: weekOffset + 1,
						},
					},
					trigger: {
						type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
						seconds: secondsUntilScheduled,
					},
				});

				console.log(
					`✅ Successfully scheduled notification for ${day} week ${weekOffset + 1} at ${hours}:${minutes} (${secondsUntilScheduled}s from now)`,
				);
			}
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	}

	private getDayIndex (day: string): number {
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

	private async checkPermissions (): Promise<boolean> {
		const { status } = await Notifications.getPermissionsAsync();
		return status === 'granted';
	}

	private async cancelUserNotifications (clerkId: string): Promise<void> {
		try {
			const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

			for (const notification of scheduledNotifications) {
				if (notification.content.data?.clerk_id === clerkId) {
					await Notifications.cancelScheduledNotificationAsync(notification.identifier);
				}
			}
		} catch (error) {
			console.error('Error canceling user notifications:', error);
		}
	}

	// Method to reschedule all notifications (call this when app starts)
	async rescheduleAllNotifications (): Promise<void> {
		try {
			const goals = await this.getWeeklyGoals();
			for (const goal of goals) {
				await this.scheduleNotificationsForGoal(goal);
			}
		} catch (error) {
			console.error('Error rescheduling notifications:', error);
		}
	}
}

export default BackgroundNotificationService.getInstance();
