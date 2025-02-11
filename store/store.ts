import { configureStore, createSlice } from "@reduxjs/toolkit";

const placeholderSlice = createSlice({
	name: "placeholder",
	initialState: {},
	reducers: {},
});

const store = configureStore({
	reducer: {
		placeholder: placeholderSlice.reducer,
	},
});

export { store };
