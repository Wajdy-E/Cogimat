import React, { useCallback, useEffect } from "react";
import { Alert, View, Platform, SafeAreaView, ScrollView } from "react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import FormInput from "@/components/FormInput";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Link, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import BackButton from "@/components/BackButton";
import { useDispatch, useSelector } from "react-redux";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useAuth, useSignUp, useSSO, useUser } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import { AppDispatch, persistor, RootState } from "@/store/store";
import { i18n } from "../i18n";
import { Text } from "@/components/ui/text";
import Apple from "../../assets/apple.svg";
import Google from "../../assets/google.svg";
import { useTheme } from "@/components/ui/ThemeProvider";
import { InputIcon } from "@/components/ui/input";
import { Eye, EyeClosed, ArrowRight, QrCode, Camera, Loader, Brain } from "lucide-react-native";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Box } from "@/components/ui/box";
import { Ionicons } from "@expo/vector-icons";
import { signUpSchema } from "@/schemas/schema";
import {
	handleEmailSignup,
	handleProviderLogin,
	handleEmailVerification,
	handleQRCodeSignup,
	handleSignOut,
} from "@/store/auth/authSaga";
import {
	setSignupFormField,
	setQrCode,
	setShowQrScanner,
	setVerificationCode,
	setUserAlreadyExists,
	resetAuthState,
	setVerificationCodeError,
	setPendingVerification,
	setIsSigningUp,
	setSessionId,
} from "@/store/auth/authSlice";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";

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
	const isFocused = useIsFocused();
	const { startSSOFlow } = useSSO();
	const { user } = useUser();
	const { signOut } = useAuth();

	// Redux state
	const {
		signupForm,
		qrCode,
		showQrScanner,
		showQrPrompt,
		pendingVerification,
		verificationCode,
		sessionId,
		isSigningUp,
		authError,
		verificationCodeError,
		userAlreadyExists,
	} = useSelector((state: RootState) => state.user);

	useWarmUpBrowser();

	// Handle QR code scanning
	const handleQRCodeScanned = (scannedQRCode: string) => {
		dispatch(setQrCode(scannedQRCode));
		dispatch(setShowQrScanner(false));
	};

	// Handle back button press in QR prompt
	const handleQRPromptBack = async () => {
		dispatch(resetAuthState());
		await dispatch(handleSignOut({ signOut, deleteUser: true, userId: user?.id }));
		router.replace("/(auth)");
	};

	// Handle QR code signup
	const handleQRCodeSignupClick = async () => {
		if (!qrCode) {
			Alert.alert(i18n.t("qrSignup.noQRCode"), i18n.t("qrSignup.scanQRCodeFirst"));
			return;
		}

		try {
			if (isLoaded) {
				const result = await dispatch(
					handleQRCodeSignup({
						userData: user,
						qrCode,
					})
				).unwrap();
				if (result.success) {
					Alert.alert(i18n.t("qrSignup.success"), i18n.t("qrSignup.accessGranted"), [
						{
							text: i18n.t("general.buttons.ok"),
							onPress: () => router.replace("/(tabs)/home"),
						},
					]);
				}
			}
		} catch (error: any) {
			console.error("QR Code Signup Error:", error);
			Alert.alert(i18n.t("qrSignup.error"), error);
		}
	};

	// Handle provider sign in
	const onProviderSignIn = useCallback(async (strategy: string) => {
		await dispatch(handleProviderLogin({ strategy, startSSOFlow }));
	}, []);

	// Handle email signup
	const signUpWithEmail = async () => {
		if (!isLoaded) return;

		try {
			await signUpSchema.validate(signupForm);
			await dispatch(
				handleEmailSignup({
					email: signupForm.email,
					password: signupForm.password,
					firstName: signupForm.firstName,
					lastName: signupForm.lastName,
					signUp,
					signOut,
				})
			);
		} catch (error: any) {
			Alert.alert(i18n.t("signup.alert.invalidData"), error.message);
		}
	};

	const onResendCode = async () => {
		await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
		Alert.alert(i18n.t("signup.alert.codeResent"), i18n.t("signup.alert.checkEmail"));
	};

	// Handle email verification
	const verifyEmailCode = async () => {
		if (!isLoaded) return;

		const result = await dispatch(
			handleEmailVerification({
				code: verificationCode,
				signUp,
				setActive,
			})
		).unwrap();

		console.log(result);
		if (result.success) {
			dispatch(setVerificationCodeError(null));
			// Store the session ID for later use in QR signup
			if (result.sessionId) {
				dispatch(setSessionId(result.sessionId));
			}
		}
	};

	// Handle user already exists alert
	useEffect(() => {
		if (userAlreadyExists) {
			Alert.alert(i18n.t("signup.userExists.title"), i18n.t("signup.userExists.message"), [
				{
					text: i18n.t("general.buttons.cancel"),
					onPress: () => dispatch(setUserAlreadyExists(false)),
				},
				{
					text: i18n.t("signup.userExists.goToLogin"),
					onPress: () => {
						dispatch(setUserAlreadyExists(false));
						router.replace("/(auth)/login");
					},
				},
			]);
		}
	}, [userAlreadyExists]);

	const onBackToSignup = () => {
		dispatch(setPendingVerification(false));
		dispatch(setIsSigningUp(false));
	};

	// Render QR scanner
	if (showQrScanner) {
		return <QRCodeScanner onQRCodeScanned={handleQRCodeScanned} onClose={() => dispatch(setShowQrScanner(false))} />;
	}

	// Render QR code prompt after successful authentication
	if (showQrPrompt) {
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
										<Button onPress={() => dispatch(setQrCode(""))} variant="outline" size="sm" className="rounded-xl">
											<ButtonText>{i18n.t("qrSignup.changeQRCode")}</ButtonText>
										</Button>
									</VStack>
								</Box>
							) : (
								<Button
									onPress={() => dispatch(setShowQrScanner(true))}
									variant="outline"
									size="xl"
									className="rounded-xl border-secondary-0"
								>
									<Camera size={20} color={themeTextColor} />
									<ButtonText className="text-typography-950">{i18n.t("qrSignup.scanQRCode")}</ButtonText>
								</Button>
							)}

							<Button
								size="lg"
								className={`rounded-xl ${!qrCode ? "opacity-25" : ""}`}
								onPress={handleQRCodeSignupClick}
								disabled={!qrCode}
							>
								<ButtonText>{i18n.t("qrSignup.createAccount")}</ButtonText>
								<ButtonIcon as={ArrowRight} size="xl" />
							</Button>

							<Button
								variant="outline"
								size="md"
								onPress={handleQRPromptBack}
								className="rounded-xl border-secondary-0"
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
						<Ionicons
							name="caret-back-outline"
							size={24}
							color={themeTextColor}
							onPress={() => onBackToSignup()}
							className="mb-[20px]"
						/>
						<Text className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("signup.verifyEmailTitle")}</Text>
					</View>
					<View className="w-screen flex-1 justify-center items-center">
						<VStack space="md" className="w-[90%] self-center">
							<FormInput
								label={"signup.verifyCode"}
								placeholder={"signup.verifyCodePlaceholder"}
								value={verificationCode}
								formSize="lg"
								inputSize="lg"
								isRequired={true}
								inputType="text"
								formErrorKey={verificationCodeError ? "signup.alert.verificationFailed" : undefined}
								onChange={(text) => dispatch(setVerificationCode(text))}
							/>
							<Button className="w-full rounded-xl" onPress={verifyEmailCode} size="md">
								<ButtonText>{i18n.t("signup.verify")}</ButtonText>
							</Button>
							<Button
								className="w-full rounded-xl"
								onPress={() => onResendCode()}
								size="md"
								variant="outline"
								action="secondary"
							>
								<ButtonText>{i18n.t("signup.resendCode")}</ButtonText>
							</Button>
						</VStack>
					</View>
				</Center>
			</SafeAreaView>
		);
	}

	// Render main signup form
	return (
		<SafeAreaView className="flex-1 bg-background-700">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
					alignItems: "center",
					paddingHorizontal: 24,
					paddingTop: 20,
					paddingBottom: 50,
				}}
			>
				<VStack space="lg" className="w-full max-w-md">
					{/* Logo */}
					<Center className="mb-4">
						<Brain size={48} color="#57CEB8" strokeWidth={2} />
					</Center>

					{/* Title and Subtitle */}
					<Center className="mb-8">
						<Heading size="2xl" className="text-typography-950 font-bold mb-2">
							Create Account
						</Heading>
						<Text className="text-typography-600 text-base">Start your cognitive training journey</Text>
					</Center>

					{/* Form Fields */}
					<VStack space="md" className="w-full">
						<FormInput
							label={"signup.form.firstName"}
							placeholder={"signup.form.firstNamePlaceholder"}
							value={signupForm.firstName}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputIcon={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
							inputType="text"
							inputVariant="rounded"
							onChange={(text) => dispatch(setSignupFormField({ field: "firstName", value: text }))}
						/>
						<FormInput
							label={"signup.form.lastName"}
							placeholder={"signup.form.lastNamePlaceholder"}
							value={signupForm.lastName}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputIcon={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
							inputType="text"
							inputVariant="rounded"
							onChange={(text) => dispatch(setSignupFormField({ field: "lastName", value: text }))}
						/>
						<FormInput
							label={"signup.form.email"}
							placeholder={"signup.form.emailPlaceholder"}
							value={signupForm.email}
							inputIcon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							inputVariant="rounded"
							onChange={(text) => dispatch(setSignupFormField({ field: "email", value: text }))}
						/>
						<FormInput
							label={"signup.form.password"}
							placeholder={"signup.form.passwordPlaceholder"}
							value={signupForm.password}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType={signupForm.showPassword ? "text" : "password"}
							inputVariant="rounded"
							onChange={(text) => dispatch(setSignupFormField({ field: "password", value: text }))}
							inputIcon={<InputIcon as={signupForm.showPassword ? Eye : EyeClosed} />}
							onIconClick={() =>
								dispatch(setSignupFormField({ field: "showPassword", value: !signupForm.showPassword }))
							}
						/>
						<FormInput
							label={"signup.form.confirmPassword"}
							placeholder={"signup.form.confirmPasswordPlaceholder"}
							value={signupForm.confirmPassword}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType={signupForm.showConfirmPassword ? "text" : "password"}
							inputVariant="rounded"
							onChange={(text) => dispatch(setSignupFormField({ field: "confirmPassword", value: text }))}
							inputIcon={<InputIcon as={signupForm.showConfirmPassword ? Eye : EyeClosed} />}
							onIconClick={() =>
								dispatch(setSignupFormField({ field: "showConfirmPassword", value: !signupForm.showConfirmPassword }))
							}
						/>

						{/* Create Account Button */}
						<Button
							className="w-full rounded-xl bg-primary-500 mt-4"
							onPress={signUpWithEmail}
							size="xl"
							disabled={isSigningUp}
						>
							<ButtonText className="text-white font-semibold">
								{i18n.t("signup.form.signUp") || "Create Account"}
							</ButtonText>
							{isSigningUp && <ButtonIcon as={Loader} size="xl" className="ml-2" />}
						</Button>

						{/* Social Login Separator */}
						<View className="flex-row items-center my-6">
							<Divider orientation="horizontal" className="flex-1 bg-secondary-300" />
							<Text className="mx-4 text-typography-600 text-sm">Or sign up with</Text>
							<Divider orientation="horizontal" className="flex-1 bg-secondary-300" />
						</View>

						{/* Social Login Buttons */}
						<View className="flex-row gap-3">
							{Platform.OS === "ios" && (
								<Button
									onPress={() => onProviderSignIn("apple")}
									variant="outline"
									size="lg"
									className="flex-1 rounded-xl border-secondary-300"
								>
									<Apple height={20} width={20} fill={themeTextColor} />
									<ButtonText className="text-typography-950 ml-2">Apple</ButtonText>
								</Button>
							)}
							<Button
								onPress={() => onProviderSignIn("google")}
								variant="outline"
								size="lg"
								className={`rounded-xl border-secondary-300 ${Platform.OS === "ios" ? "flex-1" : "w-full"}`}
							>
								<Google height={20} width={20} />
								<ButtonText className="text-typography-950 ml-2">{i18n.t("login.googleSignIn")}</ButtonText>
							</Button>
						</View>

						{/* Sign In Link */}
						<Center className="mt-6">
							<Text className="text-typography-600 text-sm">
								{i18n.t("signup.alreadyHaveAccount") || "Already have an account? "}
								<Link href={"/login"} className="text-blue-500 font-medium">
									{i18n.t("signup.login") || "Sign In"}
								</Link>
							</Text>
						</Center>
					</VStack>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}
