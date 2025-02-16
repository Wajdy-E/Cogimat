import { SafeAreaView, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BackButton from "../../components/BackButton";
import CustomSelect from "../../components/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setTheme, Theme } from "../../reducers/userSlice";
function Settings() {
	const dispatch = useDispatch();
	const theme = useSelector(
		(state: RootState) => state.user.user.settings?.theme || "light"
	);

	function handleThemeChange(newTheme: string) {
		dispatch(setTheme(newTheme as Theme));
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView>
				<BackButton />
				<View className="w-full flex justify-center items-center">
					<View className="w-[80%]">
						<View className="flex-row justify-between">
							<Text>Theme</Text>
							<CustomSelect
								options={[
									{ label: "Light", value: "light" },
									{ label: "Dark", value: "dark" },
								]}
								placeholder="Select Theme"
								value={theme}
								onChange={handleThemeChange}
							/>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Settings;
