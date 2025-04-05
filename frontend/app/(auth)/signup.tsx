import React, { useCallback, useEffect, useState } from "react";
import { Alert, View, Platform, SafeAreaView } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Button, ButtonText } from "../components/ui/button";
import FormInput from "../../components/FormInput";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Link, useRouter } from "expo-router";
import BackButton from "../../components/BackButton";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSignUp, useSSO, useUser } from "@clerk/clerk-expo";
import { OAuthStrategy } from "@clerk/types";
import { createUser } from "../../store/auth/authSaga";
import { AppDispatch } from "../../store/store";
import { i18n } from "../../i18n";
import { Text } from "@/components/ui/text";
import Apple from "../../assets/apple.svg";
import Google from "../../assets/google.svg";
import { useTheme } from "@/components/ui/ThemeProvider";
import { InputIcon } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react-native";
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
	const { user } = useUser();

	const onProviderSignIn = useCallback(async (strategy: string) => {
		try {
			const { createdSessionId, setActive } = await startSSOFlow({
				strategy: `oauth_${strategy}` as OAuthStrategy,
				redirectUrl: AuthSession.makeRedirectUri(),
			});

			if (createdSessionId) {
				setActive!({ session: createdSessionId });
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
				createUser({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
				})
			);

			router.push("/(tabs)");
		}
	}, [user]);

	async function signUpWithEmail() {
		if (!isLoaded) return;
		try {
			setLoading(true);
			await signUpSchema.validate({ firstName, lastName, email, password });

			const createdUser = await signUp.create({ emailAddress: email, password, firstName, lastName });

			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			const username = firstName + " " + lastName;
			if (!createdUser.id) throw new Error("User ID is undefined");
			dispatch(createUser({ email, firstName, username, lastName, id: createdUser.id }));

			setPendingVerification(true);
		} catch (error) {
			Alert.alert(i18n.t("signup.alert.invalidData"), (error as Error).message);
		} finally {
			setLoading(false);
		}
	}

	async function verifyEmailCode() {
		if (!isLoaded) return;
		try {
			const signUpAttempt = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (signUpAttempt.status === "complete") {
				await setActive({ session: signUpAttempt.createdSessionId });
				router.replace("/(tabs)/");
			} else {
				console.error("Verification incomplete:", signUpAttempt);
			}
		} catch (error) {
			Alert.alert(i18n.t("signup.alert.verificationFailed"), (error as Error).message);
		}
	}

	if (pendingVerification) {
		return (
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
		);
	}

	return (
		<SafeAreaView className="flex-1 justify-center items-center bg-background-700">
			<View className="w-full flex-row items-center justify-between px-6 py-4 text-center">
				<BackButton />
				<Text className="text-2xl font-bold mb-6 w-[90%]">{i18n.t("signup.title")}</Text>
			</View>
			<View className="w-screen flex-1 justify-center items-center">
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
			</View>
		</SafeAreaView>
	);
}
