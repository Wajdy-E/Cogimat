import { Tabs } from "expo-router";
import Header from "../../components/Header";

function Layout() {
	return (
		<Tabs
			screenOptions={({ route }) => ({
				header: route.name === "settings" ? () => null : () => <Header showSettings={true} />,
				tabBarStyle: { display: "none" },
			})}
		></Tabs>
	);
}

export default Layout;
