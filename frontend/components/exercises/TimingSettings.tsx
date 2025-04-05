import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { View } from "react-native";
import FormInput from "../FormInput";

interface TimingSettingsProps {
	onChange: (value: string) => void;
}
function TimingSettings(props: TimingSettingsProps) {
	return (
		<Box className="bg-secondary-500 p-5 rounded-2xl">
			<VStack space="lg">
				<Heading size="md">Duration Settings </Heading>
				<Divider className="bg-slate-400" />
				<View className="flex-row justify-between">
					<Heading size="sm">Off screen time: </Heading>
					<FormInput inputSize="sm" formSize="sm" inputType="text" onChange={props.onChange} />
				</View>
				<Heading size="sm">On screen time: </Heading>
				<Heading size="sm">Exercise time: </Heading>
			</VStack>
		</Box>
	);
}

export default TimingSettings;
