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
import { ChevronDownIcon } from "@/components/ui/icon";
import { ISelectProps, ISelectItemProps } from "@gluestack-ui/select/lib/types";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";

export interface FormSelectOptions {
	label: string;
	value: string;
	isDisabled?: boolean;
}
interface FormSelectProps {
	options: FormSelectOptions[];
	variant: "outline" | "rounded" | "underlined" | undefined;
	size: "sm" | "md" | "lg" | "xl" | undefined;
	title: string;
}

type FormSelectTypes = ISelectProps & ISelectItemProps & FormSelectProps;
function FormSelect(props: FormSelectTypes) {
	return (
		<Box className="flex-row justify-between items-center">
			<Text size="lg">{props.title}</Text>
			<Select
				selectedValue={props.selectedValue}
				defaultValue={props.selectedValue ?? ""}
				onValueChange={props.onValueChange}
			>
				<SelectTrigger variant={props.variant} size={props.size}>
					<SelectInput placeholder={props.placeholder} />
					<SelectIcon className="mr-3" as={ChevronDownIcon} />
				</SelectTrigger>
				<SelectPortal>
					<SelectBackdrop />
					<SelectContent>
						<SelectDragIndicatorWrapper>
							<SelectDragIndicator />
						</SelectDragIndicatorWrapper>
						{props.options.map((option) => (
							<SelectItem key={option.value} label={option.label} value={option.value} isDisabled={option.isDisabled} />
						))}
					</SelectContent>
				</SelectPortal>
			</Select>
		</Box>
	);
}

export default FormSelect;
