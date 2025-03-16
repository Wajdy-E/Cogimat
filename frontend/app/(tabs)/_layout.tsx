import { useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import CreateExerciseModal from "../../components/program-components/CreateExerciseModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Theme } from "../../store/auth/authSlice";

export default function TabsLayout() {
	const activeColor = "#64dac4";
	const inactiveColor = "#d3d3d3";

	const [showModal, setShowModal] = useState<boolean>(false);

	const theme = useSelector((state: RootState) => state.user.user.settings?.theme);
	const themeColor = theme === Theme.Dark ? "#000000" : "ffffff";
	const themeTextColor = theme === Theme.Dark ? "#ffffff" : "#000000";

	return (
		<View className="h-screen">
			<Tabs
				screenOptions={{
					tabBarStyle: { backgroundColor: "#000000" },
					tabBarActiveTintColor: activeColor,
					tabBarInactiveTintColor: inactiveColor,
					headerShown: true,
					headerStyle: { backgroundColor: themeColor, borderBottomColor: themeTextColor, borderBottomWidth: 1 },
					headerTintColor: themeTextColor,
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						headerShown: false,
						title: "Home",
						tabBarIcon: ({ focused }) => (
							<Ionicons name="home" size={24} color={focused ? activeColor : inactiveColor} />
						),
					}}
				/>
				<Tabs.Screen
					name="progress"
					options={{
						title: "Progress",
						tabBarIcon: ({ focused }) => (
							<Ionicons name="newspaper" size={24} color={focused ? activeColor : inactiveColor} />
						),
					}}
				/>
				<Tabs.Screen
					name="create-exercise"
					options={{
						title: "",
						tabBarButton: () => (
							<Pressable
								onPress={() => setShowModal(true)}
								style={{
									position: "absolute",
									bottom: 20,
									left: "50%",
									marginLeft: -28,
									backgroundColor: "#000000",
									borderRadius: 50,
								}}
							>
								<Ionicons name="add-circle" size={56} color={activeColor} />
							</Pressable>
						),
					}}
				/>
				<Tabs.Screen
					name="favourites"
					options={{
						title: "Favourites",
						tabBarIcon: ({ focused }) => (
							<Ionicons name="star" size={24} color={focused ? activeColor : inactiveColor} />
						),
					}}
				/>
				<Tabs.Screen
					name="account"
					options={{
						title: "Account",
						tabBarIcon: ({ focused }) => (
							<Ionicons name="person" size={24} color={focused ? activeColor : inactiveColor} />
						),
					}}
				/>
			</Tabs>
			<CreateExerciseModal isOpen={showModal} onClose={() => setShowModal(false)} />
		</View>
	);
}
