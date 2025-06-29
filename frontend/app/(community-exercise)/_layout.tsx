import { Tabs } from "expo-router";
import CommunityExerciseHeader from "../../components/CommunityExerciseHeader";

function Layout() {
	return (
		<Tabs
			screenOptions={({ route }) => ({
				header: () => null,
				tabBarStyle: { display: "none" },
			})}
		></Tabs>
	);
}

export default Layout;
