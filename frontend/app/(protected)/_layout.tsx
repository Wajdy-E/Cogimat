import { Stack } from "expo-router";
import { useAuthContext } from "@/utils/authContext";
import AuthLoading from "@/components/AuthLoading";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

export default function ProtectedLayout() {
	const { isLoggedIn, isReady, isLoading } = useAuthContext();

	// Show loading while auth is initializing
	if (!isReady || isLoading) {
		return <AuthLoading />;
	}

	// If not logged in, AuthContext will handle routing automatically
	// We don't need to redirect here since AuthContext will do it
	if (!isLoggedIn) {
		return <AuthLoading />;
	}

	return (
		<Stack>
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(exercise)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(custom-exercise)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(community-exercise)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="(admin)"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="routines"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
