import {
	Select,
	SelectTrigger,
	SelectInput,
	SelectIcon,
	SelectPortal,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicatorWrapper,
	SelectDragIndicator,
	SelectItem,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";

interface CustomSelectProps {
	options: { label: string; value: string }[];
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
}

const CustomSelect = ({
	options,
	placeholder = "Select an option",
	value,
	onChange,
}: CustomSelectProps) => {
	return (
		<Select defaultValue={value} onValueChange={onChange}>
			<SelectTrigger variant="outline" size="md">
				<SelectInput placeholder={placeholder} />
				<SelectIcon className="mr-3" as={ChevronDownIcon} />
			</SelectTrigger>
			<SelectPortal>
				<SelectBackdrop />
				<SelectContent>
					<SelectDragIndicatorWrapper>
						<SelectDragIndicator />
					</SelectDragIndicatorWrapper>
					{options.map((option) => (
						<SelectItem
							key={option.value}
							label={option.label}
							value={option.value}
						/>
					))}
				</SelectContent>
			</SelectPortal>
		</Select>
	);
};

export default CustomSelect;
