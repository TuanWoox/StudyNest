// import { createSlice } from '@reduxjs/toolkit'

// interface ThemeState {
//     mode: 'light' | 'dark'
// }

// const initialState: ThemeState = {
//     mode: 'light', // default theme
// }

// const themeSlice = createSlice({
//     name: 'theme',
//     initialState,
//     reducers: {
//         toggleTheme: (state) => {
//             state.mode = state.mode === 'light' ? 'dark' : 'light'
//         },
//         setTheme: (state, action) => {
//             state.mode = action.payload // 'light' or 'dark'
//         },
//     },
// })

// export const { toggleTheme, setTheme } = themeSlice.actions
// export default themeSlice.reducer

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface ThemeState {
    darkMode: boolean;
}

const initialState: ThemeState = {
    darkMode: false,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
        setDarkMode(state, action: PayloadAction<boolean>) {
            state.darkMode = action.payload;
        },
    },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;

export const selectDarkMode = (state: RootState) => state.theme.darkMode;

export default themeSlice.reducer;