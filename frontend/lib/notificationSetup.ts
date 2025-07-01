import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Safely import expo-device with fallback
let Device: any = null;
try {
	Device = require('expo-device');
} catch (error) {
	console.log('expo-device not available, using fallback');
}

// Configure notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export async function setupNotifications () {
	console.log('Setting up notifications...');

	// Set up notification channel for Android
	if (Platform.OS === 'android') {
		try {
			await Notifications.setNotificationChannelAsync('workout-reminders', {
				name: 'Workout Reminders',
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			});
			console.log('Android notification channel created successfully');
		} catch (error) {
			console.log('Failed to create notification channel:', error);
		}
	}

	// Request permissions
	const isDevice = Device ? Device.isDevice : true; // Fallback to true if Device not available

	if (isDevice) {
		try {
			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				console.log('Failed to get notification permissions!');
				return false;
			}

			console.log('Notification permissions granted successfully');
			return true;
		} catch (error) {
			console.log('Error setting up notifications:', error);
			return false;
		}
	} else {
		console.log('Must use physical device for notifications');
		return false;
	}
}

export async function scheduleTestNotification () {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'You\'ve got mail! 📬',
				body: 'Here is the notification body',
				data: { data: 'goes here', test: { test1: 'more data' } },
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: 2,
			},
		});
		console.log('Test notification scheduled successfully');
	} catch (error) {
		console.error('Error scheduling test notification:', error);
	}
}
