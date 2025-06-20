import { useDispatch } from "react-redux";
import { showLoadingOverlay, hideLoadingOverlay } from "../store/ui/uiSlice";

export const useLoadingOverlay = () => {
	const dispatch = useDispatch();

	const show = (message: string = "Loading...") => {
		dispatch(showLoadingOverlay(message));
	};

	const hide = () => {
		dispatch(hideLoadingOverlay());
	};

	const withLoading = async <T>(asyncFunction: () => Promise<T>, message: string = "Loading..."): Promise<T> => {
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
