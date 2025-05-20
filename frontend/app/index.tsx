import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchExercises, fetchGoals, getCustomExercises, getPublicExercises } from "../store/data/dataSaga";
import { AppDispatch, RootState } from "../store/store";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { fetchUserMilestones, setCurrentUserThunk } from "../store/auth/authSaga";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();

	useEffect(() => {
		async function handleAuthState() {
			if (isSignedIn && user) {
				// Only fetch data if we have both isSignedIn and a valid user object
				try {
					// First set the current user in Redux to ensure we have the latest user ID
					await dispatch(
						setCurrentUserThunk({
							firstName: user.firstName,
							lastName: user.lastName,
							email:
								typeof user.emailAddresses === "string" ? user.emailAddresses : user.emailAddresses[0].emailAddress,
							id: user.id,
							username: user.username,
						})
					).unwrap();

					// Then fetch the rest of the data
					await Promise.all([
						dispatch(fetchExercises()).unwrap(),
						dispatch(getCustomExercises()).unwrap(),
						dispatch(getPublicExercises()).unwrap(),
						dispatch(fetchUserMilestones()).unwrap(),
						dispatch(fetchGoals()).unwrap(),
					]);

					router.push("/(tabs)/");
				} catch (error) {
					console.error("Error fetching initial data:", error);
					// If there's an error, we should probably sign out the user
					// since their session might be invalid
					await signOut();
					router.push("/AppLoaded");
				}
			} else {
				setTimeout(() => {
					router.push("/AppLoaded");
				}, 3000);
			}
		}

		handleAuthState();
	}, [isSignedIn, user]);

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
