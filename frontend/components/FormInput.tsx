import {
	FormControl,
	FormControlError,
	FormControlErrorText,
	FormControlErrorIcon,
	FormControlLabel,
	FormControlLabelText,
	FormControlHelper,
	FormControlHelperText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { i18n } from "../i18n";

interface FormInputProps {
	label: string;
	children?: React.ReactNode;
	placeholder: string;
	value?: string;
	formErrorKey?: string;
	formHelperKey?: string;
	invalid: boolean;
	formSize: "sm" | "md" | "lg" | undefined;
	inputSize: "sm" | "md" | "lg" | undefined;
	isRequired?: boolean;
	inputType: "text" | "password" | undefined;
	onChange: (text: string) => void;
}
export default function FormInput(props: FormInputProps) {
	return (
		<FormControl isInvalid={props.invalid} isRequired={props.isRequired} size={props.formSize}>
			<FormControlLabel>
				<FormControlLabelText>{i18n.t(props.label)}</FormControlLabelText>
			</FormControlLabel>
			<Input size={props.inputSize} className="w-full">
				<InputField
					placeholder={i18n.t(props.placeholder)}
					value={props.value}
					type={props.inputType}
					onChangeText={props.onChange}
				/>
			</Input>
			{props.formHelperKey && (
				<FormControlHelper>
					<FormControlHelperText />
				</FormControlHelper>
			)}
			{props.formErrorKey && (
				<FormControlError>
					<FormControlErrorIcon />
					<FormControlErrorText />
				</FormControlError>
			)}
		</FormControl>
	);
}
