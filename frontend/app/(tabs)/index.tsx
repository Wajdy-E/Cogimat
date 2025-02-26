import { SafeAreaView, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function Home() {
	return (
		<SafeAreaProvider>
			<SafeAreaView className="bg-background-500 h-screen">
				<View></View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Home;
