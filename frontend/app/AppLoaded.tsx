import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { Button, ButtonText } from "../app/components/ui/button";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchUserData, setCurrentUserThunk } from "../store/auth/authSaga";
import { i18n } from "../i18n";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	const isProcessingRef = useRef(false);

	console.log("isSignedIn", isSignedIn);
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
					const userDataResult = await dispatch(fetchUserData(emailAddress)).unwrap();

					if (userDataResult === null) {
						// User not found in database, needs QR validation
						setTimeout(() => {
							router.push("/(auth)/signup");
						}, 500);
					} else if (userDataResult && typeof userDataResult === "object" && "hasQrAccess" in userDataResult) {
						const hasQrAccess = userDataResult.hasQrAccess;
						const isAdmin = userDataResult.isAdmin || false;

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
							// User has QR access, route to tabs
							setTimeout(() => {
								router.push("/(tabs)/");
							}, 500);
						} else {
							// User doesn't have QR access, route to signup for QR validation
							setTimeout(() => {
								router.push("/(auth)/signup");
							}, 500);
						}
					} else {
						// Invalid user data, route to signup for QR validation
						setTimeout(() => {
							router.push("/(auth)/signup");
						}, 500);
					}
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
				// If there's an error, sign out the user and stay on this page
				// This prevents routing loops
				try {
					await signOut();
				} catch (signOutError) {
					console.error("Error signing out:", signOutError);
				}
				// Don't route anywhere - let the user stay on this page with login/signup buttons
			} finally {
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
