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

function Signup() {
	return (
		<View className="flex-1 justify-center px-4">
			<VStack space="md">
				<Heading size="xl" className="text-center mb-6">
					Create Account
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

				<FormControl>
					<FormControlLabel>
						<FormControlLabelText>Confirm Password</FormControlLabelText>
					</FormControlLabel>
					<Input>
						<InputField
							placeholder="Confirm your password"
							type="password"
							className="p-2"
						/>
					</Input>
				</FormControl>

				<Button
					size="lg"
					className="mt-4"
					onPress={() => console.log("Sign up pressed")}
				>
					<ButtonText>Sign Up</ButtonText>
				</Button>
			</VStack>
		</View>
	);
}

export default Signup;
