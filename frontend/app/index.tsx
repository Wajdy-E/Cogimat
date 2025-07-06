import "../global.css";
import { ImageBackground, View, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { fetchExercises, fetchGoals, getCustomExercises, getPublicExercises } from "../store/data/dataSaga";
import { AppDispatch, RootState } from "../store/store";
import { useAuth, useUser } from "@clerk/clerk-expo";
import {
	fetchUserMilestones,
	setCurrentUserThunk,
	fetchUserData,
	checkIfUserExistsAndHasQrAccess,
} from "../store/auth/authSaga";
import { Button, ButtonText } from "@/components/ui/button";
import { i18n } from "../i18n";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	const isProcessingRef = useRef(false);
	const cancelledQRSignup = useSelector((state: RootState) => state.user.cancelledQRSignup);
	const [showAuthButtons, setShowAuthButtons] = useState(false);
	const fadeAnim = useRef(new Animated.Value(0)).current;

	console.log("isSignedIn", isSignedIn);
	useEffect(() => {
		setTimeout(() => {
			setShowAuthButtons(true);
		}, 2000);
	}, []);

	useEffect(() => {
		if (showAuthButtons) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}).start();
		}
	}, [showAuthButtons, fadeAnim]);

	useEffect(() => {
		async function handleAuthState() {
			// Prevent multiple simultaneous executions
			if (isProcessingRef.current) {
				return;
			}
			isProcessingRef.current = true;

			try {
				if (isSignedIn && user) {
					const { emailAddresses } = user;
					const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0].emailAddress;

					// Fetch user data from backend to check QR access status and get isAdmin
					const userDataResult = await dispatch(checkIfUserExistsAndHasQrAccess(user.id)).unwrap();

					if (!userDataResult.exists) {
						// User not found in database, needs QR validation
						router.push("/(auth)/signup");
					} else if (userDataResult.exists) {
						const hasQrAccess = userDataResult.hasQrAccess;
						const isAdmin = userDataResult.user.isAdmin || false;

						// Update user with backend data including isAdmin (only once)
						await dispatch(
							setCurrentUserThunk({
								firstName: user.firstName,
								lastName: user.lastName,
								email: emailAddress,
								id: user.id,
								username: user.username,
								profileUri: user.imageUrl,
								isAdmin: isAdmin,
								hasQrAccess: hasQrAccess,
							})
						).unwrap();

						if (hasQrAccess) {
							await Promise.all([
								dispatch(fetchExercises()).unwrap(),
								dispatch(getCustomExercises()).unwrap(),
								dispatch(getPublicExercises()).unwrap(),
								dispatch(fetchUserMilestones()).unwrap(),
								dispatch(fetchGoals()).unwrap(),
							]);

							router.push("/(tabs)/");
						} else {
							console.log("signing out");
							await signOut();
						}
					}
				}
			} catch (error) {
				console.error("Error fetching initial data:", error);
				// If there's an error, we should probably sign out the user
				// since their session might be invalid
				try {
					await signOut();
				} catch (signOutError) {
					console.error("Error signing out:", signOutError);
				}
				isProcessingRef.current = false;
			}
		}

		handleAuthState();
	}, [isSignedIn, user?.id]); // Only depend on isSignedIn and user.id to prevent unnecessary re-runs

	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
					{showAuthButtons && (
						<Animated.View
							className="flex gap-3 w-[250px]"
							style={{
								opacity: fadeAnim,
							}}
						>
							<Button
								className="rounded-lg"
								size="xl"
								action="primary"
								onPress={() => router.navigate("/(auth)/login")}
							>
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
						</Animated.View>
					)}
				</View>
			</ImageBackground>
		</View>
	);
}
