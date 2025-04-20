import { GestureResponderEvent, View, Alert, SafeAreaView, Platform } from "react-native";
import { Button, ButtonIcon, ButtonText } from "../../app/components/ui/button";
import { VStack } from "../components/ui/vstack";
import { Heading } from "../components/ui/heading";
import { useDispatch } from "react-redux";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import FormInput from "../../components/FormInput";
import * as Yup from "yup";
import BackButton from "../../components/BackButton";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { OAuthStrategy } from "@clerk/types";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSignIn, useSSO, useUser } from "@clerk/clerk-expo";
import { setCurrentUserThunk } from "../../store/auth/authSaga";
import { AppDispatch } from "../../store/store";
import { Text } from "@/components/ui/text";
import { i18n } from "../../i18n";
import Apple from "../../assets/apple.svg";
import Google from "../../assets/google.svg";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Box } from "@/components/ui/box";
import { ArrowRight, Eye, EyeClosed } from "lucide-react-native";
import { InputIcon } from "@/components/ui/input";
const loginSchema = Yup.object().shape({
	email: Yup.string().email(i18n.t("login.errors.invalidEmail")).required(i18n.t("login.errors.emailRequired")),
	password: Yup.string().min(6, i18n.t("login.errors.passwordShort")).required(i18n.t("login.errors.passwordRequired")),
});

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
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const dispatch: AppDispatch = useDispatch();
	const { signIn, setActive, isLoaded } = useSignIn();
	const { themeTextColor } = useTheme();
	const router = useRouter();

	useWarmUpBrowser();

	const { startSSOFlow } = useSSO();
	const { user } = useUser();

	const handleSubmit = async (e: GestureResponderEvent) => {
		e.preventDefault();
		if (!isLoaded) return;
		setLoading(true);
		try {
			await loginSchema.validate({ email, password });

			const signInAttempt = await signIn.create({
				identifier: email,
				password,
			});

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId });
			} else {
				// If the status isn't complete, check why. User might need to
				// complete further steps.
				console.error(JSON.stringify(signInAttempt, null, 2));
			}
		} catch (error) {
			if (error instanceof Yup.ValidationError) {
				Alert.alert("Validation Error", error.message);
			} else {
				console.error("Login failed", error);
				Alert.alert("Login failed. Please check your credentials.");
			}
		} finally {
			setLoading(false);
		}
	};

	const onProviderSignIn = useCallback(async (strategy: string) => {
		try {
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: `oauth_${strategy}` as OAuthStrategy,
				redirectUrl: AuthSession.makeRedirectUri({
					scheme: "cogimat",
					path: "oauth-callback",
				}),
			});
			if (createdSessionId) {
				setActive!({ session: createdSessionId });
			} else {
				// If there is no `createdSessionId`,
				// there are missing requirements, such as MFA
				// Use the `signIn` or `signUp` returned from `startSSOFlow`
				// to handle next steps
			}
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	}, []);

	useEffect(() => {
		if (user) {
			const { firstName, lastName, emailAddresses, id, username } = user;
			const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0].emailAddress;
			dispatch(
				setCurrentUserThunk({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
				})
			);
			router.replace("/(tabs)/");
		}
	}, [user]);

	return (
		<SafeAreaView className="h-screen bg-background-700">
			<View className="w-full flex-row items-center justify-between text-center">
				<BackButton />
				<Heading className="text-2xl font-bold mb-6 w-[90%]">Log In</Heading>
			</View>
			<View className="flex-1 justify-around p-4">
				<Box>
					<Heading size="4xl">Welcome Back!</Heading>
				</Box>
				<Box>
					<VStack space="lg">
						<FormInput
							label="login.email"
							placeholder="login.emailPlaceholder"
							value={email}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType="text"
							onChange={(text) => setEmail(text)}
						/>

						<FormInput
							label="login.password"
							placeholder="login.passwordPlaceholder"
							value={password}
							formSize="lg"
							inputSize="lg"
							isRequired={true}
							inputType={showPassword ? "text" : "password"}
							onChange={(text) => setPassword(text)}
							inputIcon={<InputIcon as={showPassword ? Eye : EyeClosed} />}
							onIconClick={() => setShowPassword((prev) => !prev)}
						/>

						<Button size="lg" className="rounded-full" onPress={(e) => handleSubmit(e)} disabled={loading}>
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
									{i18n.t("login.signUp")}
								</Link>
							</Text>
							<Link href="/ForgotPassword" className="underline text-primary-500">
								{i18n.t("login.forgotPassword")}
							</Link>
						</Center>
					</VStack>
				</Box>
			</View>
		</SafeAreaView>
	);
}

export default Login;
