import { Tabs } from "expo-router";
import CustomExerciseHeader from "../../components/CustomExerciseHeader";

function Layout() {
	return (
		<Tabs
			screenOptions={({ route }) => ({
				header: route.name === "settings" ? () => null : () => <CustomExerciseHeader showSettings={true} />,
				tabBarStyle: { display: "none" },
			})}
		></Tabs>
	);
}

export default Layout;
