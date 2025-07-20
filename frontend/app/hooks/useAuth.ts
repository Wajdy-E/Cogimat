import { useAuthContext } from "@/utils/authContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const useAuth = () => {
	const authContext = useAuthContext();
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const isSignedIn = useSelector((state: RootState) => state.user.isSignedIn);
	const isLoading = useSelector((state: RootState) => state.user.isLoggingIn || state.user.isSigningUp);

	return {
		...authContext,
		user,
		isSignedIn,
		isLoading: authContext.isLoading || isLoading,
	};
};
