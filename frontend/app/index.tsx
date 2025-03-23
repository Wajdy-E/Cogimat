import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchExercises } from "../store/data/dataSaga";
import { AppDispatch, RootState } from "../store/store";
import { useAuth } from "@clerk/clerk-expo";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const dispatch: AppDispatch = useDispatch();
	useEffect(() => {
		dispatch(fetchExercises());
		if (isSignedIn) {
			setTimeout(() => {
				router.push("/(tabs)/");
			}, 3000);
		} else {
			setTimeout(() => {
				router.push("/AppLoaded");
			}, 3000);
		}
	}, [isSignedIn]);
	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
				</View>
			</ImageBackground>
		</View>
	);
}
