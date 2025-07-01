import { Alert } from 'react-native';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
	title: string;
	message: string;
	type: AlertType;
	onRetry?: () => void;
}

export const useAppAlert = () => {
	const showAlert = (config: AlertConfig) => {
		const { title, message, type, onRetry } = config;

		if (onRetry) {
			Alert.alert(title, message, [
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Retry',
					onPress: onRetry,
				},
			]);
		} else {
			Alert.alert(title, message);
		}
	};

	// Convenience methods
	const showSuccess = (title: string, message: string) => {
		showAlert({ title, message, type: 'success' });
	};

	const showError = (title: string, message: string, onRetry?: () => void) => {
		showAlert({ title, message, type: 'error', onRetry });
	};

	const showWarning = (title: string, message: string) => {
		showAlert({ title, message, type: 'warning' });
	};

	const showInfo = (title: string, message: string) => {
		showAlert({ title, message, type: 'info' });
	};

	return {
		showAlert,
		showSuccess,
		showError,
		showWarning,
		showInfo,
	};
};
