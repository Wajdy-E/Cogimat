import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CreateExerciseModal from "../../components/program/CreateExerciseModal";

export default function TabsLayout() {
	const activeColor = "#64dac4";
	const inactiveColor = "#d3d3d3";

	const [showModal, setShowModal] = useState<boolean>(false);

	const router = useRouter();
	return (
		<SafeAreaProvider>
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
				<CreateExerciseModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
				/>
		</SafeAreaProvider>
	);
}
