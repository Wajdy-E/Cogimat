import "../global.css";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Card from "../components/Card";

export default function Home() {
	return (
		<View className="bg-red-500 h-full flex justify-center items-center">
			<Text>Open up bomvor.tsx to start working on your app!</Text>
			<Card title="Hello" btnKey="Click me">
				blahhhh
			</Card>
			<StatusBar style="auto" />
		</View>
	);
}
