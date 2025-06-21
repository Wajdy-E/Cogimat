import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingOverlayState {
	isVisible: boolean;
	text: string;
}

interface UIState {
	loadingOverlay: LoadingOverlayState;
	activeTabIndices: Record<string, number>;
}

const initialState: UIState = {
	loadingOverlay: {
		isVisible: false,
		text: "Loading...",
	},
	activeTabIndices: {
		home: 0,
		favourites: 0,
		default: 0,
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
		setActiveTabIndex: (state, action: PayloadAction<{ context: string; index: number }>) => {
			if (!state.activeTabIndices) {
				state.activeTabIndices = {};
			}
			state.activeTabIndices[action.payload.context] = action.payload.index;
		},
	},
});

export const { showLoadingOverlay, hideLoadingOverlay, setActiveTabIndex } = uiSlice.actions;
export default uiSlice.reducer;
