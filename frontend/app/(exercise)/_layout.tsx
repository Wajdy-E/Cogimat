import { Tabs } from "expo-router";

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
