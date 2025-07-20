import React from "react";
import { View } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function LoadingOverlay() {
	const { isVisible, text } = useSelector((state: RootState) => state.ui.loadingOverlay);

	if (!isVisible) {
		return null;
	}

	return (
		<View className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
			<Box className="bg-background-800 p-6 rounded-md mx-4">
				<HStack space="md" className="items-center">
					<Spinner />
					<Text size="lg" className="text-typography-950">
						{text}
					</Text>
				</HStack>
			</Box>
		</View>
	);
}
