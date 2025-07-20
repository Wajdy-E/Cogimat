import { useAuthContext } from "@/utils/authContext";
import AuthLoading from "@/components/AuthLoading";

export default function Index() {
	const { isReady, isLoading } = useAuthContext();

	// Show loading while auth is initializing
	if (!isReady || isLoading) {
		return <AuthLoading />;
	}

	// AuthContext will handle routing automatically
	// This component just shows loading state
	return <AuthLoading />;
}
