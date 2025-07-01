import { useDispatch } from 'react-redux';
import { showLoadingOverlay, hideLoadingOverlay } from '../store/ui/uiSlice';
import { i18n } from '../i18n';

export const useLoadingOverlay = () => {
	const dispatch = useDispatch();

	const show = (message: string = i18n.t('general.loading')) => {
		dispatch(showLoadingOverlay(message));
	};

	const hide = () => {
		dispatch(hideLoadingOverlay());
	};

	const withLoading = async <T>(
		asyncFunction: () => Promise<T>,
		message: string = i18n.t('general.loading'),
	): Promise<T> => {
		try {
			show(message);
			const result = await asyncFunction();
			return result;
		} finally {
			hide();
		}
	};

	return {
		show,
		hide,
		withLoading,
	};
};
