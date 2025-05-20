import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogBody,
	AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import React from "react";
import { i18n } from "../i18n";
import { Icon } from "@/components/ui/icon";
import { TriangleAlert } from "lucide-react-native";

interface AlertModalProps {
	isOpen: boolean;
	onClose: () => void;
	headingKey?: string;
	textKey?: string;
	buttonKey: string;
	cancelKey: string | undefined;
	onConfirm: () => void;
	action?: "default" | "primary" | "secondary" | "positive" | "negative" | undefined;
}

export default function AlertModal(props: AlertModalProps) {
	return (
		<AlertDialog
			isOpen={props.isOpen}
			onClose={props.onClose}
			size="lg"
			accessibilityLabel={i18n.t("general.alerts.warning")}
		>
			<AlertDialogBackdrop />
			<AlertDialogContent size="lg">
				<VStack space="lg">
					{props.headingKey && (
						<AlertDialogHeader className="flex-row gap-2">
							<Icon as={TriangleAlert} size="lg" className="stroke-warning-400" />
							<Heading className="text-typography-950 font-semibold" size="md">
								{i18n.t(props.headingKey)}
							</Heading>
						</AlertDialogHeader>
					)}
					{props.textKey && (
						<AlertDialogBody className="mt-3 mb-4">
							<Text size="sm">{i18n.t(props.textKey)}</Text>
						</AlertDialogBody>
					)}
					<AlertDialogFooter>
						<Button
							variant="outline"
							action="secondary"
							onPress={props.onClose}
							size="sm"
							accessibilityLabel={i18n.t(props.cancelKey ?? "general.buttons.cancel")}
						>
							<ButtonText>{i18n.t(props.cancelKey ?? "general.buttons.cancel")}</ButtonText>
						</Button>

						{props.onConfirm && props.buttonKey && (
							<Button
								size="sm"
								onPress={props.onConfirm}
								action={props.action}
								accessibilityLabel={i18n.t(props.buttonKey)}
							>
								<ButtonText>{i18n.t(props.buttonKey)}</ButtonText>
							</Button>
						)}
					</AlertDialogFooter>
				</VStack>
			</AlertDialogContent>
		</AlertDialog>
	);
}
