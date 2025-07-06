import React, { useCallback, useEffect, useState } from "react";
import { Alert, View, Platform, SafeAreaView, ScrollView } from "react-native";
import { Button, ButtonIcon, ButtonText } from "../components/ui/button";
import FormInput from "../../components/FormInput";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Link, useRouter } from "expo-router";
import BackButton from "../../components/BackButton";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useAuth, useSignUp, useSSO, useUser } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import { checkIfUserExistsAndHasQrAccess, createUser } from "../../store/auth/authSaga";
import { AppDispatch } from "../../store/store";
import { i18n } from "../../i18n";
import { Text } from "@/components/ui/text";
import Apple from "../../assets/apple.svg";
import Google from "../../assets/google.svg";
import { useTheme } from "@/components/ui/ThemeProvider";
import { InputIcon } from "@/components/ui/input";
import { Eye, EyeClosed, ArrowRight, QrCode, Camera, Loader } from "lucide-react-native";
import QRCodeScanner from "../../components/QRCodeScanner";
import { Box } from "@/components/ui/box";
import { setCurrentUserThunk } from "../../store/auth/authSaga";
import { fetchExercises, fetchGoals, getCustomExercises, getPublicExercises } from "../../store/data/dataSaga";
import { fetchUserMilestones } from "../../store/auth/authSaga";
import { Ionicons } from "@expo/vector-icons";
import { setCancelledQRSignup } from "../../store/auth/authSlice";

export const useWarmUpBrowser = () => {
	useEffect(() => {
		void WebBrowser.warmUpAsync();
		return () => {
			void WebBrowser.coolDownAsync();
		};
	}, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
	const router = useRouter();
	const dispatch: AppDispatch = useDispatch();
	const { isLoaded, signUp, setActive } = useSignUp();
	const { themeTextColor } = useTheme();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [pendingVerification, setPendingVerification] = useState(false);
	const [code, setCode] = useState("");

	// QR Code states
	const [qrCode, setQrCode] = useState("");
	const [showScanner, setShowScanner] = useState(false);
	const [showQRPrompt, setShowQRPrompt] = useState(false);

	const signUpSchema = Yup.object().shape({
		firstName: Yup.string()
			.min(2, i18n.t("signup.errors.firstNameShort"))
			.required(i18n.t("signup.errors.firstNameRequired")),
		lastName: Yup.string()
			.min(2, i18n.t("signup.errors.lastNameShort"))
			.required(i18n.t("signup.errors.lastNameRequired")),
		email: Yup.string().email(i18n.t("signup.errors.invalidEmail")).required(i18n.t("signup.errors.emailRequired")),
		password: Yup.string()
			.min(6, i18n.t("signup.errors.passwordShort"))
			.required(i18n.t("signup.errors.passwordRequired")),
	});

	useWarmUpBrowser();

	const { startSSOFlow } = useSSO();
	const { user, isSignedIn } = useUser();
	const { signOut } = useAuth();

	// Reset QR prompt state when component unmounts or user signs out
	useEffect(() => {
		return () => {
			setShowQRPrompt(false);
			setQrCode("");
			setShowScanner(false);
			signOut();
		};
	}, []);

	useEffect(() => {
		if (!isSignedIn) {
			setShowQRPrompt(false);
			setQrCode("");
			setShowScanner(false);
		}
	}, [isSignedIn]);

	const onProviderSignIn = useCallback(async (strategy: string) => {
		try {
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: `oauth_${strategy}` as OAuthStrategy,
				redirectUrl: AuthSession.makeRedirectUri({
					scheme: "cogimat",
					path: "oauth-callback",
				}),
			});

			console.log("createdSessionId", createdSessionId);

			if (createdSessionId) {
				await setActive?.({ session: createdSessionId });
			}
		} catch (err) {
			console.error("OAuth Error:", JSON.stringify(err, null, 2));
		}
	}, []);

	// Handle QR code scanning
	const handleQRCodeScanned = (scannedQRCode: string) => {
		setQrCode(scannedQRCode);
		setShowScanner(false);
		dispatch(setCancelledQRSignup(false));
	};

	// Handle back button press in QR prompt
	const handleQRPromptBack = async () => {
		setShowQRPrompt(false);
		setQrCode("");
		dispatch(setCancelledQRSignup(true));
		await signOut();
	};

	// Handle QR code signup using the createUser thunk
	const handleQRCodeSignup = async (userData: any) => {
		if (!qrCode) {
			Alert.alert(i18n.t("qrSignup.noQRCode"), i18n.t("qrSignup.scanQRCodeFirst"));
			return;
		}

		try {
			setLoading(true);

			const { firstName, lastName, emailAddresses, id, username } = userData;
			const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

			// Create user in database with QR validation
			const createdUser = await dispatch(
				createUser({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
					qrCode,
				})
			).unwrap();

			// Set the current user in Redux with the created user data
			dispatch(
				setCurrentUserThunk({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
					profileUri: userData.imageUrl,
					isAdmin: createdUser.isAdmin || false, // Use isAdmin from backend
					hasQrAccess: true, // User now has QR access
				})
			);

			// Fetch all necessary data before redirecting
			await Promise.all([
				dispatch(fetchExercises()).unwrap(),
				dispatch(getCustomExercises()).unwrap(),
				dispatch(getPublicExercises()).unwrap(),
				dispatch(fetchUserMilestones()).unwrap(),
				dispatch(fetchGoals()).unwrap(),
			]);

			Alert.alert(i18n.t("qrSignup.success"), i18n.t("qrSignup.accessGranted"), [
				{
					text: i18n.t("general.buttons.ok"),
					onPress: () => router.replace("/(tabs)/"),
				},
			]);
		} catch (error: any) {
			console.error("QR Code Signup Error:", error);
			const errorMessage = error.message || i18n.t("qrSignup.error");
			Alert.alert(i18n.t("qrSignup.error"), errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Handle successful authentication (email or provider)
	useEffect(() => {
		const checkUserAndQR = async () => {
			if (user && isSignedIn) {
				// Set the current user in Redux from Clerk data
				const { firstName, lastName, emailAddresses, id, username } = user;
				const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

				dispatch(
					setCurrentUserThunk({
						firstName,
						lastName,
						email: emailAddress,
						id,
						username,
						profileUri: user.imageUrl,
						isAdmin: false, // Will be updated from backend data
					})
				);

				try {
					const result = await dispatch(checkIfUserExistsAndHasQrAccess(id)).unwrap();
					if (result.exists && result.hasQrAccess) {
						setShowQRPrompt(false);
					} else {
						console.log("user does not exist or does not have QR access");
						setShowQRPrompt(true);
					}
				} catch (error) {
					console.error("Error checking user existence:", error);
				}
			}
		};

		checkUserAndQR();
	}, [user, isSignedIn]);

	async function signUpWithEmail() {
		if (!isLoaded) {
			return;
		}
		try {
			setLoading(true);
			await signUpSchema.validate({ firstName, lastName, email, password });

			await signUp.create({ emailAddress: email, password, firstName, lastName });

			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			setPendingVerification(true);
		} catch (error) {
			Alert.alert(i18n.t("signup.alert.invalidData"), (error as Error).message);
		} finally {
			setLoading(false);
		}
	}

	async function verifyEmailCode() {
		if (!isLoaded) {
			return;
		}
		try {
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (signUpAttempt.status === "complete") {
				await setActive({ session: signUpAttempt.createdSessionId });
				// User will be handled in useEffect when user is available, which will show QR prompt
			} else {
				console.error("Verification incomplete:", signUpAttempt);
			}
		} catch (error) {
			Alert.alert(i18n.t("signup.alert.verificationFailed"), (error as Error).message);
		}
	}

	// Render QR scanner
	if (showScanner) {
		return <QRCodeScanner onQRCodeScanned={handleQRCodeScanned} onClose={() => setShowScanner(false)} />;
	}

	console.log("showQRPrompt", showQRPrompt);
	// Render QR code prompt after successful authentication
	if (showQRPrompt) {
		return (
			<SafeAreaView className="h-screen bg-background-700">
				<View className="w-full flex-row items-center justify-between text-center">
					<Ionicons
						name="caret-back-outline"
						size={24}
						color={themeTextColor}
						onPress={handleQRPromptBack}
						className="mb-[20px]"
					/>
					<Heading className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("qrSignup.title")}</Heading>
				</View>
				<View className="flex-1 justify-around p-4">
					<Box>
						<Heading size="3xl">{i18n.t("qrSignup.welcome")}</Heading>
						<Text className="text-typography-950 mt-2">{i18n.t("qrSignup.description")}</Text>
					</Box>
					<Box>
						<VStack space="lg">
							{/* QR Code Display */}
							{qrCode ? (
								<Box className="bg-background-500 p-4 rounded-lg border border-secondary-0">
									<VStack space="sm" className="items-center">
										<QrCode size={32} color={themeTextColor} />
										<Text className="text-typography-950 font-medium">{i18n.t("qrSignup.qrCodeScanned")}</Text>
										<Button onPress={() => setQrCode("")} variant="outline" size="sm">
											<ButtonText>{i18n.t("qrSignup.changeQRCode")}</ButtonText>
										</Button>
									</VStack>
								</Box>
							) : (
								<Button
									onPress={() => setShowScanner(true)}
									variant="outline"
									size="xl"
									className="rounded-full border-secondary-0"
								>
									<Camera size={20} color={themeTextColor} />
									<ButtonText className="text-typography-950">{i18n.t("qrSignup.scanQRCode")}</ButtonText>
								</Button>
							)}

							<Button
								size="lg"
								className={`rounded-full ${loading || !qrCode ? "opacity-25" : ""}`}
								onPress={() => handleQRCodeSignup(user)}
								disabled={loading || !qrCode}
							>
								<ButtonText>{i18n.t("qrSignup.createAccount")}</ButtonText>
								<ButtonIcon as={loading ? Loader : ArrowRight} size="xl" />
							</Button>

							<Button
								variant="outline"
								size="md"
								onPress={handleQRPromptBack}
								className="rounded-full border-secondary-0"
							>
								<ButtonText className="text-typography-950">{i18n.t("general.buttons.cancel")}</ButtonText>
							</Button>
						</VStack>
					</Box>
				</View>
			</SafeAreaView>
		);
	}

	// Render email verification
	if (pendingVerification) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center bg-background-700">
				<Center className="flex-1 justify-center items-center bg-background-700">
					<View className="w-full flex-row items-center justify-between px-6 py-4 text-center">
						<BackButton />
						<Text className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("signup.verifyEmailTitle")}</Text>
					</View>
					<View className="w-screen flex-1 justify-center items-center">
						<VStack space="md" className="w-[90%] self-center">
							<FormInput
								label={"signup.verifyCode"}
								placeholder={"signup.verifyCodePlaceholder"}
								value={code}
								formSize="lg"
								inputSize="lg"
								isRequired={true}
								inputType="text"
								onChange={(text) => setCode(text)}
							/>
							<Button className="w-full rounded-lg" disabled={loading} onPress={verifyEmailCode} size="xl">
								<ButtonText>{i18n.t("signup.verify")}</ButtonText>
							</Button>
						</VStack>
					</View>
				</Center>
			</SafeAreaView>
		);
	}

	// Render main signup form
	return (
		<SafeAreaView className="flex-1 justify-center items-center bg-background-700">
			<View className="w-full flex-row items-center justify-between px-6 py-4 text-center">
				<BackButton />
				<Text className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("signup.title")}</Text>
			</View>
			<ScrollView
				className="w-screen flex-1"
				contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 }}
			>
				<VStack space="md" className="w-[90%]">
					<Center className="flex gap-5">
						<FormInput
							label={"signup.form.firstName"}
							placeholder={"signup.form.firstNamePlaceholder"}
							value={firstName}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							onChange={(text) => setFirstName(text)}
						/>
						<FormInput
							label={"signup.form.lastName"}
							placeholder={"signup.form.lastNamePlaceholder"}
							value={lastName}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							onChange={(text) => setLastName(text)}
						/>
						<FormInput
							label={"signup.form.email"}
							placeholder={"signup.form.emailPlaceholder"}
							value={email}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							onChange={(text) => setEmail(text)}
						/>

						<FormInput
							label={"signup.form.password"}
							placeholder={"signup.form.passwordPlaceholder"}
							value={password}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType={showPassword ? "text" : "password"}
							onChange={(text) => setPassword(text)}
							inputIcon={<InputIcon as={showPassword ? Eye : EyeClosed} />}
							onIconClick={() => setShowPassword((prev) => !prev)}
						/>

						<Button className="w-full rounded-full" disabled={loading} onPress={signUpWithEmail} size="xl">
							<ButtonText>{i18n.t("signup.form.signUp")}</ButtonText>
							<ButtonIcon as={loading ? Loader : ArrowRight} size="xl" />
						</Button>

						{Platform.OS === "ios" && (
							<Button
								onPress={() => onProviderSignIn("apple")}
								variant="outline"
								size="xl"
								className="rounded-full w-100 border-secondary-0"
								style={{ width: "100%" }}
							>
								<Apple height={20} width={20} fill={themeTextColor} />
								<ButtonText className="text-typography-950">{i18n.t("login.appleSignIn")}</ButtonText>
							</Button>
						)}

						<Button
							onPress={() => onProviderSignIn("google")}
							variant="outline"
							size="xl"
							className="rounded-full w-full border-secondary-0"
						>
							<Google height={20} width={20} />
							<ButtonText className="text-typography-950">{i18n.t("login.googleSignIn")}</ButtonText>
						</Button>
						<Text>
							{i18n.t("signup.alreadyHaveAccount")}{" "}
							<Link href={"/login"} className="underline text-primary-500">
								{i18n.t("signup.login")}
							</Link>
						</Text>
					</Center>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}
