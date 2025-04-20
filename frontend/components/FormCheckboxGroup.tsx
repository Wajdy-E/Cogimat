import React from "react";
import { Center } from "@/components/ui/center";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon, CheckboxGroup } from "@/components/ui/checkbox";
import { VStack } from "@/components/ui/vstack";
import { CheckIcon } from "@/components/ui/icon";
import { Size } from "./CustomSlider";
import { i18n } from "../i18n";

export interface CheckboxOption {
	label: string;
	value: string;
	isDisabled?: boolean;
}

interface FormCheckboxGroupProps {
	options: CheckboxOption[];
	value: string[];
	onChange: (values: string[]) => void;
	className?: string;
	direction?: "row" | "column";
	alignCenter?: boolean;
	space?: Size;
	labelLeft?: boolean;
	checkBoxClasses?: string;
}

export default function FormCheckboxGroup(props: FormCheckboxGroupProps) {
	const Wrapper = props.alignCenter ? Center : React.Fragment;
	const wrapperProps = props.alignCenter ? {} : undefined;

	return (
		<Wrapper {...wrapperProps}>
			<CheckboxGroup value={props.value} onChange={props.onChange}>
				<VStack className={props.className} space="md">
					{props.options.map((option) => (
						<Checkbox
							key={option.value}
							value={option.value}
							isDisabled={option.isDisabled}
							className={`${props.checkBoxClasses}`}
						>
							{props.labelLeft ? <CheckboxLabel>{i18n.t(option.label)}</CheckboxLabel> : null}
							<CheckboxIndicator>
								<CheckboxIcon as={CheckIcon} />
							</CheckboxIndicator>
							{!props.labelLeft ? <CheckboxLabel>{i18n.t(option.label)}</CheckboxLabel> : null}
						</Checkbox>
					))}
				</VStack>
			</CheckboxGroup>
		</Wrapper>
	);
}
