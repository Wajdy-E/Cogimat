import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import CreateExerciseModal from "../../components/program-components/CreateExerciseModal";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useDispatch } from "react-redux";
import { setCustomExerciseModalPopup, setPaywallModalPopup } from "../../store/data/dataSlice";
import { Button, ButtonIcon } from "@/components/ui/button";
import { PlusCircleIcon, PlusIcon } from "lucide-react-native";
import PaywallDrawer from "../../components/PaywallDrawer";

export default function TabsLayout() {
	const activeColor = "#64dac4";
	const inactiveColor = "#d3d3d3";

	const dispatch = useDispatch();
	const { themeBackgroundColor, themeTextColor } = useTheme();

	const isOpen = useSelector((state: RootState) => state.data.popupStates.customExerciseModalIsOpen ?? false);
	const isPaywallOpen = useSelector((state: RootState) => state.data.popupStates.paywallIsOpen);

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
					name="WeeklyGoal"
					options={{
						title: "Weekly workout goal",
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
							<Button
								onPress={() => dispatch(setCustomExerciseModalPopup(true))}
								variant="solid"
								style={{
									position: "absolute",
									bottom: 20,
									left: "50%",
									marginLeft: -28,
									borderRadius: 50,
									height: 50,
									width: 50,
								}}
							>
								<ButtonIcon as={PlusIcon} color={"white"} height={30} width={30} />
							</Button>
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
			<CreateExerciseModal isOpen={isOpen} onClose={() => dispatch(setCustomExerciseModalPopup(false))} />
			<PaywallDrawer isOpen={isPaywallOpen} onClose={() => dispatch(setPaywallModalPopup(false))} />
		</View>
	);
}
