import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import {
	Modal,
	ModalBackdrop,
	ModalContent,
	ModalCloseButton,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Icon, CloseIcon } from "@/components/ui/icon";
import React, { PropsWithChildren } from "react";
import { i18n } from "../i18n";
interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	headingKey?: string;
	textKey?: string;
	buttonKey?: string;
	cancelKey?: string;
	onConfirm?: () => void;
}

export default function ModalComponent(props: PropsWithChildren<ModalProps>) {
	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose} size="md">
			<ModalBackdrop />
			<ModalContent>
				<ModalHeader>
					<Heading size="md" className="text-typography-950">
						{props.headingKey}
					</Heading>
					<ModalCloseButton>
						<Icon as={CloseIcon} size="md" />
					</ModalCloseButton>
				</ModalHeader>
				<ModalBody>
					<Text size="sm" className="text-typography-500">
						{props.textKey}
					</Text>
					{props.children}
				</ModalBody>
				<ModalFooter>
					<Button variant="outline" action="secondary" onPress={props.onClose}>
						<ButtonText>{i18n.t(props.cancelKey ?? "general.buttons.cancel")}</ButtonText>
					</Button>
					<Button onPress={props.onConfirm}>
						<ButtonText>{i18n.t(props.buttonKey ?? "general.buttons.save")}</ButtonText>
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
