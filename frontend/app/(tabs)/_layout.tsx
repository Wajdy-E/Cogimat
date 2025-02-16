import { useEffect } from "react";
import axios from "axios";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function TabsLayout() {
	const activeColor = "#64dac4";
	const inactiveColor = "#d3d3d3";

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Use the correct backend URL
				const response = await axios.post(
					"http://192.168.2.32:3000/api/auth/signup"
				);
				console.log("API Response:", response.data);
			} catch (error) {
				console.error("API Error:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<Tabs
			screenOptions={{
				tabBarStyle: { backgroundColor: "#000000" },
				tabBarActiveTintColor: activeColor,
				tabBarInactiveTintColor: inactiveColor,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="home"
							size={24}
							color={focused ? activeColor : inactiveColor}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="progress"
				options={{
					title: "Progress",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="newspaper"
							size={24}
							color={focused ? activeColor : inactiveColor}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="create-exercise"
				options={{
					title: "",
					headerShown: false,
					tabBarButton: ({ onPress }) => (
						<Pressable
							onPress={onPress}
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
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="star"
							size={24}
							color={focused ? activeColor : inactiveColor}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="account"
				options={{
					title: "Account",
					headerShown: false,
					tabBarIcon: ({ focused }) => (
						<Ionicons
							name="person"
							size={24}
							color={focused ? activeColor : inactiveColor}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
