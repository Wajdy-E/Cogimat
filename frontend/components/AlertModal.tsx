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

interface AlertModalProps {
	isOpen: boolean;
	onClose: () => void;
	headingKey?: string;
	textKey?: string;
	buttonKey?: string;
	cancelKey?: string;
	onConfirm?: () => void;
}

export default function AlertModal(props: AlertModalProps) {
	return (
		<AlertDialog isOpen={props.isOpen} onClose={props.onClose} size="md">
			<AlertDialogBackdrop />
			<AlertDialogContent size="md">
				<VStack space="lg">
					{props.headingKey && (
						<AlertDialogHeader>
							<Heading className="text-typography-950 font-semibold" size="md">
								{props.headingKey}
							</Heading>
						</AlertDialogHeader>
					)}
					{props.textKey && (
						<AlertDialogBody className="mt-3 mb-4">
							<Text size="sm">{props.textKey}</Text>
						</AlertDialogBody>
					)}
					<AlertDialogFooter>
						{props.cancelKey && (
							<Button variant="outline" action="secondary" onPress={props.onClose} size="sm">
								<ButtonText>{props.cancelKey}</ButtonText>
							</Button>
						)}
						{props.onConfirm && props.buttonKey && (
							<Button size="sm" onPress={props.onConfirm}>
								<ButtonText>{props.buttonKey}</ButtonText>
							</Button>
						)}
					</AlertDialogFooter>
				</VStack>
			</AlertDialogContent>
		</AlertDialog>
	);
}
