import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { checkIfUserExistsAndHasQrAccess } from '@/store/auth/authSaga';

interface SubscriptionStatus {
	isSubscribed: boolean;
	isMonthly: boolean;
	isYearly: boolean;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useSubscriptionStatus(): SubscriptionStatus {
	const dispatch = useDispatch();
	const userId = useSelector((state: RootState) => state.user.user.baseInfo?.id);
	const isSubscribed = useSelector((state: RootState) => state.user.user.baseInfo?.isSubscribed === true);

	const refetch = useCallback(async () => {
		if (userId) {
			await dispatch(checkIfUserExistsAndHasQrAccess(userId)).unwrap();
		}
	}, [dispatch, userId]);

	return {
		isSubscribed,
		isMonthly: false,
		isYearly: false,
		isLoading: false,
		error: null,
		refetch,
	};
}
