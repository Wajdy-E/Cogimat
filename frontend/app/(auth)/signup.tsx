import { View, Text } from "react-native";
import { Button, ButtonText } from "../components/ui/button";
import { Input, InputField } from "../components/ui/input";
import { VStack } from "../components/ui/vstack";
import { Heading } from "../components/ui/heading";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
} from "../components/ui/form-control";
import { Formik } from "formik";
import { signupSchema } from "../../schemas/schema";
import { useState, useEffect } from "react";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

function Signup() {
	const [loading, setLoading] = useState(false);

	// Google OAuth
	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: process.env.GOOGLE_CLIENT_ID,
		iosClientId: "YOUR_IOS_CLIENT_ID",
		androidClientId: "YOUR_ANDROID_CLIENT_ID",
	});

	// Handle Google Sign-In Response
	useEffect(() => {
		if (response?.type === "success") {
			const { authentication } = response;
			if (authentication?.accessToken) {
				handleGoogleSignup(authentication.accessToken);
			}
		}
	}, [response]);

	// Handle Email/Password Signup
	const handleSubmit = async (values: any) => {
		setLoading(true);
		try {
			const response = await axios.post(
				"http://192.168.2.32:3000/api/auth/signup",
				values
			);
			console.log("API Response:", response.data);

			if (response.status === 200) {
				console.log("Account created:", response.data);
			} else {
				console.log("Error:", response.data.message);
			}
		} catch (error) {
			console.error("Signup failed:", error);
		} finally {
			setLoading(false);
		}
	};

	// Handle Google Signup
	const handleGoogleSignup = async (accessToken: string) => {
		setLoading(true);
		try {
			const response = await axios.post(
				"http://192.168.2.32:3000/api/auth/google",
				{ accessToken }
			);
			console.log("Google Signup Response:", response.data);
		} catch (error) {
			console.error("Google signup failed:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 justify-center px-4">
			<Heading size="xl" className="text-center mb-6">
				Create Account
			</Heading>

			<Formik
				initialValues={{
					firstName: "",
					lastName: "",
					email: "",
					password: "",
				}}
				validationSchema={signupSchema}
				onSubmit={handleSubmit}
			>
				{({
					handleChange,
					handleBlur,
					handleSubmit,
					values,
					errors,
					touched,
				}) => (
					<VStack space="md">
						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>First Name</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your first name"
									value={values.firstName}
									onChangeText={handleChange("firstName")}
									onBlur={handleBlur("firstName")}
									className="p-2"
								/>
							</Input>
							{touched.firstName && errors.firstName && (
								<Text style={{ color: "red" }}>{errors.firstName}</Text>
							)}
						</FormControl>

						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Last Name</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your last name"
									value={values.lastName}
									onChangeText={handleChange("lastName")}
									onBlur={handleBlur("lastName")}
									className="p-2"
								/>
							</Input>
							{touched.lastName && errors.lastName && (
								<Text style={{ color: "red" }}>{errors.lastName}</Text>
							)}
						</FormControl>

						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Email</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your email"
									value={values.email}
									onChangeText={handleChange("email")}
									onBlur={handleBlur("email")}
									className="p-2"
								/>
							</Input>
							{touched.email && errors.email && (
								<Text style={{ color: "red" }}>{errors.email}</Text>
							)}
						</FormControl>

						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Password</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your password"
									value={values.password}
									onChangeText={handleChange("password")}
									onBlur={handleBlur("password")}
									secureTextEntry
									className="p-2"
								/>
							</Input>
							{touched.password && errors.password && (
								<Text style={{ color: "red" }}>{errors.password}</Text>
							)}
						</FormControl>

						<Button
							size="lg"
							className="mt-4"
							onPress={() => handleSubmit()}
							disabled={loading}
						>
							<ButtonText>{loading ? "Signing Up..." : "Sign Up"}</ButtonText>
						</Button>

						{/* Google Sign-In Button */}
						<Button
							size="lg"
							className="mt-4 bg-blue-500"
							onPress={() => promptAsync()}
							disabled={!request || loading}
						>
							<ButtonText>Sign Up with Google</ButtonText>
						</Button>
					</VStack>
				)}
			</Formik>
		</View>
	);
}

export default Signup;
