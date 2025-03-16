import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { Button, ButtonText } from "../app/components/ui/button";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchExercises } from "../store/data/dataSaga";
import { AppDispatch, RootState } from "../store/store";
import { useSelector } from "react-redux";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const isSignedIn = useSelector((state: RootState) => state.user.isSignedIn);

	const dispatch: AppDispatch = useDispatch();
	useEffect(() => {
		dispatch(fetchExercises());

		if (isSignedIn) {
			setTimeout(() => {
				router.push("/(tabs)/");
			}, 100);
		}
	}, []);
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

						<Button
							className="rounded-lg"
							size="xl"
							variant="outline"
							action="primary"
							onPress={() => router.navigate("/(tabs)/account")}
						>
							<ButtonText>ACCOUNT</ButtonText>
						</Button>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
}
