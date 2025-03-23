import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { Button, ButtonText } from "../app/components/ui/button";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn } = useAuth();
	useEffect(() => {
		if (isSignedIn) {
			setTimeout(() => {
				router.push("/(tabs)/");
			}, 500);
		}
	}, [isSignedIn]);
	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
					<View className="flex gap-3 w-[250px]">
						<Button className="rounded-lg" size="xl" action="primary" onPress={() => router.navigate("/(auth)/login")}>
							<ButtonText className="text-white">LOG IN</ButtonText>
						</Button>
						<Button
							className="rounded-lg"
							size="xl"
							variant="outline"
							action="primary"
							onPress={() => router.navigate("/(auth)/signup")}
						>
							<ButtonText>REGISTER</ButtonText>
						</Button>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
}
