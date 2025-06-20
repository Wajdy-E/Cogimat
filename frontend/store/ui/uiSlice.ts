import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingOverlayState {
	isVisible: boolean;
	text: string;
}

interface UIState {
	loadingOverlay: LoadingOverlayState;
}

const initialState: UIState = {
	loadingOverlay: {
		isVisible: false,
		text: "Loading...",
	},
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		showLoadingOverlay: (state, action: PayloadAction<string>) => {
			state.loadingOverlay.isVisible = true;
			state.loadingOverlay.text = action.payload;
		},
		hideLoadingOverlay: (state) => {
			state.loadingOverlay.isVisible = false;
		},
	},
});

export const { showLoadingOverlay, hideLoadingOverlay } = uiSlice.actions;
export default uiSlice.reducer;
