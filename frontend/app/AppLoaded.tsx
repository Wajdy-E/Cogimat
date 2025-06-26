import "../global.css";
import { ImageBackground, View } from "react-native";
import { Image } from "react-native";
import { Button, ButtonText } from "../app/components/ui/button";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchUserData, setCurrentUserThunk } from "../store/auth/authSaga";

export default function Home() {
	const backgroundImage = require("../assets/index.png");
	const logo = require("../assets/cogimatlogo.png");
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	console.log("isSignedIn", isSignedIn);
	useEffect(() => {
		async function handleAuthState() {
			if (isSignedIn && user) {
				try {
					const { emailAddresses } = user;
					const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0].emailAddress;

					// First, set the current user in Redux from Clerk data
					await dispatch(
						setCurrentUserThunk({
							firstName: user.firstName,
							lastName: user.lastName,
							email: emailAddress,
							id: user.id,
							username: user.username,
							profileUri: user.imageUrl,
							isAdmin: false, // Will be updated from backend data
						})
					).unwrap();

					// Then fetch user data from backend to check QR access status and get isAdmin
					const userDataResult = await dispatch(fetchUserData(emailAddress)).unwrap();

					if (userDataResult === null) {
						// User not found in database, needs QR validation
						setTimeout(() => {
							router.push("/(auth)/signup");
						}, 500);
					} else if (userDataResult && typeof userDataResult === "object" && "hasQrAccess" in userDataResult) {
						const hasQrAccess = userDataResult.hasQrAccess;
						const isAdmin = userDataResult.isAdmin || false;

						// Update user with backend data including isAdmin
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
				} catch (error) {
					console.error("Error fetching user data:", error);
					// If there's an error, route to signup for QR validation
					setTimeout(() => {
						router.push("/(auth)/signup");
					}, 500);
				}
			}
		}

		handleAuthState();
	}, [isSignedIn, user]);

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
