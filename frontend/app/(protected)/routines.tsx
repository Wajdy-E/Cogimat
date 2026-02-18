import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import Routines from "@/components/Routines";
import BackButton from "@/components/BackButton";

export default function RoutinesPage() {
	return (
		<ScrollView className="bg-background-700" contentContainerStyle={{ paddingBottom: 50 }}>
			<SafeAreaView>
				<VStack space="lg" className="w-[90%] self-center py-4">
					<BackButton showLabel />
					<Routines />
				</VStack>
			</SafeAreaView>
		</ScrollView>
	);
}
