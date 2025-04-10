import { useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import CreateExerciseModal from "../../components/program-components/CreateExerciseModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Theme } from "../../store/auth/authSlice";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function TabsLayout() {
	const activeColor = "#64dac4";
	const inactiveColor = "#d3d3d3";

	const [showModal, setShowModal] = useState<boolean>(false);
	const { themeBackgroundColor, themeTextColor } = useTheme();

	return (
		<View className="h-screen">
			<Tabs
				screenOptions={{
					tabBarStyle: { backgroundColor: themeBackgroundColor },
					tabBarActiveTintColor: activeColor,
					tabBarInactiveTintColor: inactiveColor,
					headerShown: true,
					headerStyle: {
						backgroundColor: themeBackgroundColor,
						borderBottomColor: themeTextColor,
						borderBottomWidth: 1,
					},
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
					name="all-exercises"
					options={{
						title: "All Exercises",
						href: null,
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
