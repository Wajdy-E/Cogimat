import {
	Select,
	SelectTrigger,
	SelectInput,
	SelectIcon,
	SelectPortal,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectItem,
} from "@/components/ui/select";
import { ISelectProps, ISelectItemProps } from "@gluestack-ui/select/lib/types";
import { i18n } from "../i18n";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import React from "react";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "@/components/ui/ThemeProvider";
export interface FormSelectOptions {
	label: string;
	value: string;
	isDisabled?: boolean;
}
interface FormSelectProps {
	options: FormSelectOptions[];
	variant: "outline" | "rounded" | "underlined" | undefined;
	size: "sm" | "md" | "lg" | undefined;
	title: string;
}

type FormSelectTypes = ISelectProps & ISelectItemProps & FormSelectProps;
function FormSelect(props: FormSelectTypes) {
	const { themeTextColor } = useTheme();
	return (
		<FormControl isRequired={props.isRequired} size={props.size}>
			<FormControlLabel>
				<FormControlLabelText>{i18n.t(props.title)}</FormControlLabelText>
			</FormControlLabel>
			<Select
				selectedValue={props.selectedValue}
				defaultValue={props.selectedValue ?? ""}
				onValueChange={props.onValueChange}
			>
				<SelectTrigger
					variant={props.variant}
					size={props.size}
					className="justify-between"
					style={{ paddingRight: 5 }}
				>
					<SelectInput placeholder={props.placeholder} />
					<SelectIcon as={ChevronDown} stroke={themeTextColor} />
				</SelectTrigger>
				<SelectPortal>
					<SelectBackdrop />
					<SelectContent>
						<SelectDragIndicatorWrapper>
							<SelectDragIndicator />
						</SelectDragIndicatorWrapper>
						{props.options.map((option) => (
							<SelectItem
								key={option.value}
								label={i18n.t(option.label)}
								value={option.value}
								isDisabled={option.isDisabled}
							/>
						))}
					</SelectContent>
				</SelectPortal>
			</Select>
		</FormControl>
	);
}

export default FormSelect;
