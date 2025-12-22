import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
	// Remove auth checks - let the main _layout.tsx handle all routing logic
	// This prevents infinite loading loops
	return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}
