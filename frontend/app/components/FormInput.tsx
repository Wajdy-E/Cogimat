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
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { i18n } from "../i18n";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { AlertCircleIcon } from "@/components/ui/icon";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface FormInputProps {
	label: string;
	children?: React.ReactNode;
	placeholder?: string;
	value?: string;
	formErrorKey?: string;
	formHelperKey?: string;
	invalid?: boolean;
	formSize: "sm" | "md" | "lg" | undefined;
	inputSize: "sm" | "md" | "lg" | undefined;
	isRequired?: boolean;
	inputType: "text" | "password" | undefined;
	defaultValue?: string;
	onChange?: (text: string) => void;
	displayAsRow?: boolean;
	onIconClick?: () => void;
	inputIcon?: React.ReactNode;
	inputVariant?: "outline" | "rounded" | "underlined" | undefined;
	isDisabled?: boolean;
	suffix?: string;
	labelSize?: "sm" | "md" | "lg" | undefined;
}

function FormInputComponent(props: FormInputProps) {
	return (
		<FormControl
			isInvalid={props.invalid}
			isRequired={props.isRequired}
			size={props.formSize}
			className="w-full"
			isDisabled={props.isDisabled}
		>
			<View className={props.displayAsRow ? "flex-row justify-between items-center" : ""}>
				<FormControlLabel>
					<FormControlLabelText size={props.labelSize}>{i18n.t(props.label ?? "")}</FormControlLabelText>
				</FormControlLabel>
				<Input
					size={props.inputSize}
					className={props.displayAsRow ? "flex-1 ml-2" : "w-full"}
					variant={props.inputVariant}
				>
					{props.inputType === "password" ? (
						<>
							<InputSlot className="pl-4">
								<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
							</InputSlot>
							<InputField
								placeholder={i18n.t(props.placeholder ?? "")}
								type={props.inputType}
								defaultValue={props.defaultValue}
								value={props.value}
								onChange={(e) => props.onChange?.(e.nativeEvent.text)}
							/>
							{props.inputIcon && (
								<InputSlot className="pr-4" onPress={props.onIconClick}>
									{props.inputIcon}
								</InputSlot>
							)}
						</>
					) : (
						<>
							{props.inputIcon && (
								<InputSlot className="pl-4">
									{props.inputIcon}
								</InputSlot>
							)}
							<InputField
								placeholder={i18n.t(props.placeholder ?? "")}
								type={props.inputType}
								defaultValue={props.defaultValue}
								value={props.value}
								onChange={(e) => props.onChange?.(e.nativeEvent.text)}
							/>
						</>
					)}
				</Input>
				{props.suffix && (
					<Text size={props.inputSize} className="ml-3">
						{props.suffix}
					</Text>
				)}
			</View>
			{props.formHelperKey && (
				<FormControlHelper>
					<FormControlHelperText size="md">{i18n.t(props.formHelperKey)}</FormControlHelperText>
				</FormControlHelper>
			)}
			{props.formErrorKey && (
				<FormControlError>
					<FormControlErrorIcon as={AlertCircleIcon} />
					<FormControlErrorText size="sm">{i18n.t(props.formErrorKey)}</FormControlErrorText>
				</FormControlError>
			)}
		</FormControl>
	);
}

export default FormInputComponent;
