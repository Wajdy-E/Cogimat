// import "../global.css";
import { ImageBackground, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { fetchExercises, fetchGoals, getCustomExercises, getPublicExercises } from "../../store/data/dataSaga";
import { AppDispatch } from "../../store/store";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { fetchUserMilestones, setCurrentUserThunk, checkIfUserExistsAndHasQrAccess } from "../../store/auth/authSaga";
import { Button, ButtonText } from "@/components/ui/button";
import { i18n } from "../i18n";

export default function Home() {
	const backgroundImage = require("../../assets/index.png");
	const logo = require("../../assets/cogiprologo.png");
	const router = useRouter();
	const { isSignedIn, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	const isProcessingRef = useRef(false);

	console.log("isSignedIn", isSignedIn);

	// useEffect(() => {
	// 	async function handleAuthState() {
	// 		// Prevent multiple simultaneous executions
	// 		if (isProcessingRef.current) {
	// 			return;
	// 		}
	// 		isProcessingRef.current = true;

	// 		try {
	// 			if (isSignedIn && user) {
	// 				console.log("user in auth/index", user);
	// 				const { emailAddresses } = user;
	// 				const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0].emailAddress;
	// 				console.log("emailAddress", emailAddress);
	// 				// Fetch user data from backend to check QR access status and get isAdmin
	// 				const userDataResult = await dispatch(checkIfUserExistsAndHasQrAccess(user.id)).unwrap();

	// 				if (!userDataResult.exists) {
	// 					// User not found in database, needs QR validation
	// 					router.push("/(auth)/signup");
	// 				} else if (userDataResult.exists) {
	// 					const hasQrAccess = userDataResult.hasQrAccess;
	// 					const isAdmin = userDataResult.user.isAdmin || false;
	// 					console.log("setting current user in handleAuthStatein index");
	// 					// Update user with backend data including isAdmin (only once)
	// 					await dispatch(
	// 						setCurrentUserThunk({
	// 							firstName: user.firstName,
	// 							lastName: user.lastName,
	// 							email: emailAddress,
	// 							id: user.id,
	// 							username: user.username,
	// 							profileUri: user.imageUrl,
	// 							isAdmin: isAdmin,
	// 							hasQrAccess: hasQrAccess,
	// 						})
	// 					).unwrap();

	// 					if (hasQrAccess) {
	// 						await Promise.all([
	// 							dispatch(fetchExercises()).unwrap(),
	// 							dispatch(getCustomExercises()).unwrap(),
	// 							dispatch(getPublicExercises()).unwrap(),
	// 							dispatch(fetchUserMilestones()).unwrap(),
	// 							dispatch(fetchGoals()).unwrap(),
	// 						]);
	// 						console.log("routing to home");
	// 						router.push("/(tabs)/home");
	// 					} else {
	// 						console.log("signing out");
	// 						await signOut();
	// 					}
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error("Error fetching initial data:", error);
	// 			// If there's an error, we should probably sign out the user
	// 			// since their session might be invalid
	// 			try {
	// 				await signOut();
	// 			} catch (signOutError) {
	// 				console.error("Error signing out:", signOutError);
	// 			}
	// 			isProcessingRef.current = false;
	// 		}
	// 	}

	// 	handleAuthState();
	// }, [isSignedIn, user?.id]);

	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
					<View className="flex gap-3 w-[250px]">
						<Button className="rounded-lg" size="xl" action="primary" onPress={() => router.navigate("/(auth)/login")}>
							<ButtonText className="text-white">{i18n.t("login.loginButton")}</ButtonText>
						</Button>
						<Button
							className="rounded-lg"
							size="xl"
							variant="outline"
							action="primary"
							onPress={() => router.navigate("/(auth)/signup")}
						>
							<ButtonText>{i18n.t("signup.register")}</ButtonText>
						</Button>
					</View>
				</View>
			</ImageBackground>
		</View>
	);
}
