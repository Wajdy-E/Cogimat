import { useAuth, useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import FormInput from "../../components/FormInput";
import { GestureResponderEvent } from "react-native";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [successfulCreation, setSuccessfulCreation] = useState(false);
	const [secondFactor, setSecondFactor] = useState(false);
	const [error, setError] = useState("");

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
		await signIn
			?.create({
				strategy: "reset_password_email_code",
				identifier: email,
			})
			.then(() => {
				setSuccessfulCreation(true);
				setError("");
			})
			.catch((err) => {
				console.error("error", err.errors[0].longMessage);
				setError(err.errors[0].longMessage);
			});
	}

	async function reset(e: GestureResponderEvent) {
		e.preventDefault();
		await signIn
			?.attemptFirstFactor({
				strategy: "reset_password_email_code",
				code,
				password,
			})
			.then((result) => {
				if (result.status === "needs_second_factor") {
					setSecondFactor(true);
					setError("");
				} else if (result.status === "complete") {
					setActive({ session: result.createdSessionId });
					setError("");
				} else {
					console.log(result);
				}
			})
			.catch((err) => {
				console.error("error", err.errors[0].longMessage);
				setError(err.errors[0].longMessage);
			});
	}

	return (
		<VStack className="p-4 h-full flex justify-center bg-background-700">
			<Text size="2xl" className="mb-4">
				Forgot Password?
			</Text>
			<Box>
				{!successfulCreation ? (
					<>
						<FormInput
							label="Email"
							placeholder="e.g john@doe.com"
							value={email}
							onChange={setEmail}
							formSize="md"
							inputSize="md"
							inputType="text"
							invalid={!!error}
							formErrorKey={error}
							isRequired
						/>
						<Button onPress={create} className="mt-4">
							<ButtonText>Send password reset code</ButtonText>
						</Button>
					</>
				) : (
					<>
						<FormInput
							label="New Password"
							placeholder="Enter new password"
							value={password}
							onChange={setPassword}
							formSize="md"
							inputSize="md"
							inputType="password"
							isRequired
							invalid={!!error}
							formErrorKey={error}
						/>
						<FormInput
							label="Reset Code"
							placeholder="Enter reset code"
							value={code}
							onChange={setCode}
							formSize="md"
							inputSize="md"
							inputType="text"
							isRequired
							invalid={!!error}
							formErrorKey={error}
						/>
						<Button onPress={reset} className="mt-4">
							<ButtonText>Reset</ButtonText>
						</Button>
					</>
				)}
				{secondFactor && <Text className="text-red-600 mt-2">2FA is required, but this UI does not handle that</Text>}
			</Box>
		</VStack>
	);
}
