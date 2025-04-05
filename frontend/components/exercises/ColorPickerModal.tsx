import ModalComponent from "../Modal";
import WheelColorPicker from "react-native-wheel-color-picker";

export default function ColorPickerModal({
	isOpen,
	onClose,
	onConfirm,
	onColorChange,
}: {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	onColorChange: (color: string) => void;
}) {
	return (
		<ModalComponent isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
			<WheelColorPicker onColorChangeComplete={onColorChange} />
		</ModalComponent>
	);
}
