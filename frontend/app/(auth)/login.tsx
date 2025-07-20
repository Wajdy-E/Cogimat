import { GestureResponderEvent, View, Alert, SafeAreaView, Platform } from "react-native";
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
import { ArrowRight, Eye, EyeClosed } from "lucide-react-native";
import { InputIcon } from "@/components/ui/input";
import { handleEmailLogin, handleProviderLogin } from "@/store/auth/authSaga";
import { setLoginFormField } from "@/store/auth/authSlice";
import { loginSchema } from "@/schemas/schema";

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

		try {
			await loginSchema.validate(loginForm);
			await dispatch(
				handleEmailLogin({
					email: loginForm?.email || "",
					password: loginForm?.password || "",
					signIn,
					setActive,
				})
			);
		} catch (error: any) {
			Alert.alert(i18n.t("login.alert.invalidData"), error.message);
		}
	};

	const onProviderSignIn = useCallback(async (strategy: string) => {
		await dispatch(handleProviderLogin({ strategy, startSSOFlow }));
	}, []);

	return (
		<SafeAreaView className="h-screen bg-background-700">
			<View className="w-full flex-row items-center justify-between text-center">
				<BackButton />
				<Heading className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("login.title")}</Heading>
			</View>
			<VStack className="flex-1 justify-center p-4" space="lg">
				<Box>
					<Heading size="4xl">{i18n.t("login.welcomeBack")}</Heading>
				</Box>
				<Box>
					<VStack space="lg">
						<FormInput
							label="login.email"
							placeholder="login.emailPlaceholder"
							value={loginForm?.email || ""}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							onChange={(text) => dispatch(setLoginFormField({ field: "email", value: text }))}
						/>

						<FormInput
							label="login.password"
							placeholder="login.passwordPlaceholder"
							value={loginForm?.password || ""}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType={loginForm?.showPassword ? "text" : "password"}
							onChange={(text) => dispatch(setLoginFormField({ field: "password", value: text }))}
							inputIcon={<InputIcon as={loginForm?.showPassword ? Eye : EyeClosed} />}
							onIconClick={() =>
								dispatch(setLoginFormField({ field: "showPassword", value: !loginForm?.showPassword }))
							}
						/>

						<Button size="lg" className="rounded-full" onPress={(e) => handleSubmit(e)} disabled={isLoggingIn}>
							<ButtonText>{i18n.t("login.loginButton")}</ButtonText>
							<ButtonIcon as={ArrowRight} />
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

						<Center className="flex gap-4">
							<Text>
								{i18n.t("login.noAccount")}{" "}
								<Link href={"/signup"} className="underline text-primary-500">
									{i18n.t("signup.form.signUp")}
								</Link>
							</Text>
							<Link href="/ForgotPassword" className="underline text-primary-500">
								{i18n.t("login.forgotPassword")}
							</Link>
						</Center>
					</VStack>
				</Box>
			</VStack>
		</SafeAreaView>
	);
}

export default Login;
