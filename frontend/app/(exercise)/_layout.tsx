import { Tabs } from "expo-router";
import Header from "../../components/Header";

function Layout() {
	return (
		<Tabs
			screenOptions={{
				header: () => <Header />,
				tabBarStyle: { display: "none" },
			}}
		></Tabs>
	);
}

export default Layout;
