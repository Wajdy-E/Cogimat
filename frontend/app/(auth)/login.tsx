import { GestureResponderEvent, View, Alert, SafeAreaView, Platform, ScrollView } from "react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { useDispatch, useSelector } from "react-redux";
import React, { useCallback, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import FormInput from "@/components/FormInput";
import BackButton from "@/components/BackButton";
import { Center } from "@/components/ui/center";
import * as WebBrowser from "expo-web-browser";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { AppDispatch, RootState } from "@/store/store";
import { Text } from "@/components/ui/text";
import { i18n } from "../i18n";
import Apple from "../../assets/apple.svg";
import Google from "../../assets/google.svg";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Box } from "@/components/ui/box";
import { ArrowRight, Eye, EyeClosed, Brain, Loader } from "lucide-react-native";
import { InputIcon } from "@/components/ui/input";
import { handleEmailLogin, handleProviderLogin } from "@/store/auth/authSaga";
import { setLoginFormField } from "@/store/auth/authSlice";
import { Divider } from "@/components/ui/divider";
import { Ionicons } from "@expo/vector-icons";

export const useWarmUpBrowser = () => {
	useEffect(() => {
		void WebBrowser.warmUpAsync();
		return () => {
			void WebBrowser.coolDownAsync();
		};
	}, []);
};

WebBrowser.maybeCompleteAuthSession();

function Login() {
	const dispatch: AppDispatch = useDispatch();
	const { signIn, setActive, isLoaded } = useSignIn();
	const { themeTextColor } = useTheme();
	const router = useRouter();
	const { startSSOFlow } = useSSO();

	// Redux state
	const { loginForm, isLoggingIn, authError } = useSelector((state: RootState) => state.user);

	useWarmUpBrowser();

	const handleSubmit = async (e: GestureResponderEvent) => {
		e.preventDefault();
		if (!isLoaded) return;

		// Basic validation - check if fields are empty
		if (!loginForm?.email?.trim() || !loginForm?.password?.trim()) {
			Alert.alert(i18n.t("login.alerts.validationError"), i18n.t("login.errors.emptyFields"));
			return;
		}

		try {
			const result = await dispatch(
				handleEmailLogin({
					email: loginForm.email,
					password: loginForm.password,
					signIn,
					setActive,
				})
			);

			// Check if login failed
			if (handleEmailLogin.rejected.match(result)) {
				Alert.alert(i18n.t("login.alerts.validationError"), i18n.t("login.errors.invalidCredentials"));
			}
		} catch (error: any) {
			Alert.alert(i18n.t("login.alerts.validationError"), i18n.t("login.errors.invalidCredentials"));
		}
	};

	const onProviderSignIn = useCallback(async (strategy: string) => {
		await dispatch(handleProviderLogin({ strategy, startSSOFlow }));
	}, []);

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
						<View className="w-16 h-16 rounded-full bg-primary-200 items-center justify-center">
							<Brain size={32} color="white" strokeWidth={2} />
						</View>
					</Center>

					{/* App Name and Slogan */}
					<Center className="mb-8">
						<Heading size="2xl" className="text-typography-950 font-bold mb-2">
							{i18n.t("login.appName") || "Cogipro"}
						</Heading>
						<Text className="text-typography-600 text-base">
							{i18n.t("login.slogan") || "Train your mind, move your body"}
						</Text>
					</Center>

					{/* Form Fields */}
					<VStack space="md" className="w-full">
						<FormInput
							label="login.email"
							placeholder="login.emailPlaceholder"
							value={loginForm?.email || ""}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							inputVariant="rounded"
							inputIcon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
							onChange={(text) => dispatch(setLoginFormField({ field: "email", value: text }))}
						/>

						<View>
							<FormInput
								label="login.password"
								placeholder="login.passwordPlaceholder"
								value={loginForm?.password || ""}
								formSize="lg"
								inputSize="lg"
								isRequired={true}
								inputType={loginForm?.showPassword ? "text" : "password"}
								inputVariant="rounded"
								onChange={(text) => dispatch(setLoginFormField({ field: "password", value: text }))}
								inputIcon={<InputIcon as={loginForm?.showPassword ? Eye : EyeClosed} />}
								onIconClick={() =>
									dispatch(setLoginFormField({ field: "showPassword", value: !loginForm?.showPassword }))
								}
							/>
							{/* Forgot Password Link */}
							<View className="flex-row justify-end mt-2">
								<Link href="/ForgotPassword" className="text-blue-500 text-sm">
									{i18n.t("login.forgotPassword")}
								</Link>
							</View>
						</View>

						{/* Sign In Button */}
						<Button
							className="w-full rounded-xl bg-primary-500 mt-4"
							onPress={(e) => handleSubmit(e)}
							size="xl"
							disabled={isLoggingIn}
						>
							<ButtonText className="text-white font-semibold">{i18n.t("login.loginButton") || "Sign In"}</ButtonText>
							{isLoggingIn && <ButtonIcon as={Loader} size="xl" className="ml-2" />}
						</Button>

						{/* Social Login Separator */}
						<View className="flex-row items-center my-6">
							<Divider orientation="horizontal" className="flex-1 bg-secondary-300" />
							<Text className="mx-4 text-typography-600 text-sm">
								{i18n.t("login.orContinueWith") || "Or continue with"}
							</Text>
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
									<ButtonText className="text-typography-950 ml-2">{i18n.t("login.appleSignIn")}</ButtonText>
								</Button>
							)}
							<Button
								onPress={() => onProviderSignIn("google")}
								variant="outline"
								size="lg"
								className={`rounded-xl border-secondary-300  ${Platform.OS === "ios" ? "flex-1" : "w-full"}`}
							>
								<Google height={20} width={20} />
								<ButtonText className="text-typography-950 ml-2">{i18n.t("login.googleSignIn")}</ButtonText>
							</Button>
						</View>

						{/* Sign Up Link */}
						<Center className="mt-6">
							<Text className="text-typography-600 text-sm">
								{i18n.t("login.noAccount") || "Don't have an account? "}
								<Link href={"/signup"} className="text-blue-500 font-medium">
									{i18n.t("login.signUp") || "Sign Up"}
								</Link>
							</Text>
						</Center>
					</VStack>
				</VStack>
			</ScrollView>
		</SafeAreaView>
	);
}

export default Login;
