import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import FormInput from "../../components/FormInput";
import { GestureResponderEvent, View } from "react-native";
import { i18n } from "../../i18n";
import { Heading } from "@/components/ui/heading";
import BackButton from "../../components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Yup from "yup";

const forgotPasswordSchema = Yup.object().shape({
	email: Yup.string().email(i18n.t("signup.errors.invalidEmail")).required(i18n.t("signup.errors.emailRequired")),
	password: Yup.string()
		.min(6, i18n.t("signup.errors.passwordShort"))
		.required(i18n.t("signup.errors.passwordRequired")),
	code: Yup.string().required(i18n.t("forgotPassword.resetCodeRequired")),
});

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [successfulCreation, setSuccessfulCreation] = useState(false);
	const [secondFactor, setSecondFactor] = useState(false);
	const [errors, setErrors] = useState({
		email: "",
		password: "",
		code: "",
		general: "",
	});

	const router = useRouter();
	const { isSignedIn } = useAuth();
	const { isLoaded, signIn, setActive } = useSignIn();

	useEffect(() => {
		if (isSignedIn) {
			router.push("/");
		}
	}, [isSignedIn, router]);

	if (!isLoaded) {
		return null;
	}

	async function create(e: GestureResponderEvent) {
		try {
			await forgotPasswordSchema.validateAt("email", { email });
			await signIn
				?.create({
					strategy: "reset_password_email_code",
					identifier: email,
				})
				.then(() => {
					setSuccessfulCreation(true);
					setErrors({ email: "", password: "", code: "", general: "" });
				})
				.catch((err) => {
					console.error("error", err.errors[0].longMessage);
					setErrors((prev) => ({ ...prev, general: err.errors[0].longMessage }));
				});
		} catch (err: unknown) {
			if (err instanceof Yup.ValidationError) {
				setErrors((prev) => ({ ...prev, email: err.message }));
			} else {
				setErrors((prev) => ({ ...prev, general: "An unexpected error occurred" }));
			}
		}
	}

	async function reset(e: GestureResponderEvent) {
		e.preventDefault();
		try {
			await forgotPasswordSchema.validate({ password, code });
			await signIn
				?.attemptFirstFactor({
					strategy: "reset_password_email_code",
					code,
					password,
				})
				.then((result) => {
					if (result.status === "needs_second_factor") {
						setSecondFactor(true);
						setErrors({ email: "", password: "", code: "", general: "" });
					} else if (result.status === "complete") {
						setActive({ session: result.createdSessionId });
						setErrors({ email: "", password: "", code: "", general: "" });
					} else {
					}
				})
				.catch((err) => {
					console.error("error", err.errors[0].longMessage);
					setErrors((prev) => ({ ...prev, general: err.errors[0].longMessage }));
				});
		} catch (err: unknown) {
			if (err instanceof Yup.ValidationError) {
				const newErrors = { email: "", password: "", code: "", general: "" };
				if (err.path) {
					newErrors[err.path as keyof typeof newErrors] = err.message;
				} else {
					err.inner.forEach((error) => {
						if (error.path) {
							newErrors[error.path as keyof typeof newErrors] = error.message;
						}
					});
				}
				setErrors(newErrors);
			} else {
				setErrors((prev) => ({ ...prev, general: "An unexpected error occurred" }));
			}
		}
	}

	return (
		<SafeAreaView className="p-4 h-screen bg-background-700">
			<View className="w-full flex-row items-center">
				<BackButton classes="none" />
				<Heading className="text-2xl font-bold w-[90%]">{i18n.t("forgotPassword.title")}</Heading>
			</View>
			<View className="flex-1 justify-center">
				<VStack space="lg">
					{!successfulCreation ? (
						<>
							<FormInput
								label="forgotPassword.email"
								placeholder={"forgotPassword.emailPlaceholder"}
								value={email}
								onChange={setEmail}
								formSize="lg"
								inputSize="lg"
								inputType="text"
								invalid={!!errors.email}
								formErrorKey={errors.email}
								isRequired
							/>
							<Button onPress={create} className="mt-4">
								<ButtonText>{i18n.t("forgotPassword.sendPasswordResetCode")}</ButtonText>
							</Button>
						</>
					) : (
						<>
							<FormInput
								label="forgotPassword.newPassword"
								placeholder={"forgotPassword.newPasswordPlaceholder"}
								value={password}
								onChange={setPassword}
								formSize="lg"
								inputSize="lg"
								inputType="password"
								isRequired
								invalid={!!errors.password}
								formErrorKey={errors.password}
							/>
							<FormInput
								label="forgotPassword.resetCode"
								placeholder={"forgotPassword.resetCodePlaceholder"}
								value={code}
								onChange={setCode}
								formSize="lg"
								inputSize="lg"
								inputType="text"
								isRequired
								invalid={!!errors.code}
								formErrorKey={errors.code}
							/>
							<Button onPress={reset} className="mt-4">
								<ButtonText>{i18n.t("forgotPassword.reset")}</ButtonText>
							</Button>
						</>
					)}
					{errors.general && <Text className="text-red-600 mt-2">{errors.general}</Text>}
					{secondFactor && <Text className="text-red-600 mt-2">2FA is required, but this UI does not handle that</Text>}
				</VStack>
			</View>
		</SafeAreaView>
	);
}
