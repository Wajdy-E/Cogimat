import { Tabs } from "expo-router";
import CustomExerciseHeader from "../../components/CustomExerciseHeader";

function Layout() {
	return (
		<Tabs
			screenOptions={{
				header: () => <CustomExerciseHeader />,
				tabBarStyle: { display: "none" },
			}}
		></Tabs>
	);
}

export default Layout;
