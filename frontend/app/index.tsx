import "../global.css";
import { ImageBackground, SafeAreaView, View } from "react-native";
import { Image } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Button, ButtonText } from "./components/ui/button";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	return (
		<SafeAreaProvider>
			<SafeAreaView className="flex-1 bg-black">
				<ImageBackground
					source={backgroundImage}
					resizeMode="cover"
					className="h-screen"
				>
					<View className="h-full bg-black/50 justify-center items-center">
						<Image
							source={logo}
							resizeMode="contain"
							className="aspect-square max-w-[250px]"
						/>
						<View className="flex gap-3 w-[250px]">
							<Button className="rounded-lg" size="xl" action="primary">
								<ButtonText className="text-white">LOG IN</ButtonText>
							</Button>
							<Button
								className="rounded-lg"
								size="xl"
								variant="outline"
								action="primary"
							>
								<ButtonText className="text-white">REGISTER</ButtonText>
							</Button>
						</View>
					</View>
				</ImageBackground>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}
