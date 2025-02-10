import { View } from "react-native";
import { Button, ButtonText } from "../components/ui/button";
import { Input, InputField } from "../components/ui/input";
import { VStack } from "../components/ui/vstack";
import { Heading } from "../components/ui/heading";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
} from "../components/ui/form-control";

function Login() {
	return (
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
						<InputField placeholder="Enter your email" className="p-2" />
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
						/>
					</Input>
				</FormControl>

				<Button
					size="lg"
					className="mt-4"
					onPress={() => console.log("Login pressed")}
				>
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
	);
}

export default Login;
