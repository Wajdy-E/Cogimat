import { Stack } from "expo-router";
import { useAuthContext } from "@/utils/authContext";
import AuthLoading from "@/components/AuthLoading";

export default function AuthRoutesLayout() {
	const { isLoggedIn, isReady, isLoading } = useAuthContext();

	// Show loading while auth is initializing
	if (!isReady || isLoading) {
		return <AuthLoading />;
	}

	// If logged in, AuthContext will handle routing automatically
	// We don't need to redirect here since AuthContext will do it
	if (isLoggedIn) {
		return <AuthLoading />;
	}

	return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}
