import { SafeAreaView, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "../../components/program/Colors";
import { Heading } from "@/components/ui/heading";
import Shapes from "../../components/program/Shapes";
function CreateExercise() {
	return (
		<SafeAreaProvider>
			<SafeAreaView className="bg-background-500 h-screen">
				<View className="w-full flex items-center">
					<View className="flex-col w-[80%] gap-2">
							<Heading size="lg">Colors</Heading>
							<Colors />
					</View>
				</View>
				<Shapes />
			</SafeAreaView>
			<StatusBar />
		</SafeAreaProvider>
	);
}

export default CreateExercise;
