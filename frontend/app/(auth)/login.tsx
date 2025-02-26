import { GestureResponderEvent, SafeAreaView, View } from "react-native";
import { Button, ButtonText } from "../components/ui/button";
import { Input, InputField } from "../components/ui/input";
import { VStack } from "../components/ui/vstack";
import { Heading } from "../components/ui/heading";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
} from "../components/ui/form-control";
import { useDispatch } from "react-redux";
import axios from "axios";
import React, { useState } from "react";
import { setCurrentUser } from "../../reducers/userSlice";
import { SafeAreaProvider } from "react-native-safe-area-context";

function Login() {
	// State to store email and password
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const dispatch = useDispatch();

	const handleSubmit = async (e: GestureResponderEvent) => {
		e.preventDefault();

		if (!email || !password) {
			alert("Please enter both email and password");
			return;
		}

		try {
			// Make API call with email and password
			const response = await axios.post(
				"http://192.168.2.32:3000/api/auth/login",
				{
					email,
					password,
				}
			);

			if (response.status === 200) {
				dispatch(setCurrentUser(response.data));
			}
		} catch (error) {
			// Handle error (e.g., display an error message)
			console.error("Login failed", error);
			alert("Login failed. Please check your credentials.");
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView className="bg-background-500 h-screen">
				<View className="flex-1 justify-center px-4">
					<VStack space="md">
						<Heading size="xl" className="text-center mb-6">
							Login
						</Heading>

						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Email</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your email"
									className="p-2"
									value={email}
									onChangeText={setEmail} // Update email state
								/>
							</Input>
						</FormControl>

						<FormControl>
							<FormControlLabel>
								<FormControlLabelText>Password</FormControlLabelText>
							</FormControlLabel>
							<Input>
								<InputField
									placeholder="Enter your password"
									type="password"
									className="p-2"
									value={password}
									onChangeText={setPassword} // Update password state
								/>
							</Input>
						</FormControl>

						<Button size="lg" className="mt-4" onPress={(e) => handleSubmit(e)}>
							<ButtonText>Login</ButtonText>
						</Button>

						<Button
							variant="link"
							size="sm"
							className="mt-2"
							onPress={() => console.log("Forgot password pressed")}
						>
							<ButtonText>Forgot Password?</ButtonText>
						</Button>

						<Button
							variant="link"
							size="sm"
							onPress={() => console.log("Sign up pressed")}
						>
							<ButtonText>Don't have an account? Sign up</ButtonText>
						</Button>
					</VStack>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Login;
