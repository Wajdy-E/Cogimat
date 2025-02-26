import React, { useEffect, useState } from "react";
import {
	Alert,
	Button,
	NativeSyntheticEvent,
	StyleSheet,
	TextInputChangeEventData,
	View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import { Input, InputField } from "@/components/ui/input"; // Assuming Gluestack Input
import { Session } from "@supabase/supabase-js";
import { Text } from "react-native";

export default function Auth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);
	async function signInWithEmail() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) Alert.alert(error.message);
		setLoading(false);
	}

	async function signUpWithEmail() {
		setLoading(true);
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
		});

		if (error) Alert.alert(error.message);
		if (!session)
			Alert.alert("Please check your inbox for email verification!");
		setLoading(false);
	}

	return (
		<View style={styles.container}>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Input className="min-w-[250px]">
					<InputField
						type="text"
						value={email}
						onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) =>
							setEmail(e.nativeEvent.text)
						}
					/>
				</Input>
			</View>
			<View style={styles.verticallySpaced}>
				<Input className="min-w-[250px]">
					<InputField
						type="password"
						value={password}
						onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) =>
							setPassword(e.nativeEvent.text)
						}
					/>
				</Input>
			</View>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title="Sign in"
					disabled={loading}
					onPress={() => signInWithEmail()}
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<Button
					title="Sign up"
					disabled={loading}
					onPress={() => signUpWithEmail()}
				/>
			</View>
			{session && session.user && (
				<>
					<Text>{session.user.id}</Text>
				</>
			)}

			<AppleAuthentication.AppleAuthenticationButton
				buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
				buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
				cornerRadius={5}
				style={{ width: 200, height: 64 }}
				onPress={async () => {
					try {
						const credential = await AppleAuthentication.signInAsync({
							requestedScopes: [
								AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
								AppleAuthentication.AppleAuthenticationScope.EMAIL,
							],
						});
						// Sign in via Supabase Auth.
						if (credential.identityToken) {
							const { error, data } = await supabase.auth.signInWithIdToken({
								provider: "apple",
								token: credential.identityToken,
								 // Replace with your Apple Service ID
							});

							console.log(
								"Apple Credential:",
								JSON.stringify(credential, null, 2)
							);

							console.log(error);

							if (!error) {
								// User is signed in.
							}
						} else {
							throw new Error("No identityToken.");
						}
					} catch (e) {}
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 12,
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "stretch",
	},
	mt20: {
		marginTop: 20,
	},
});
