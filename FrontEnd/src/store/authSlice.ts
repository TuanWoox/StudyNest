import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { RootState } from "./store";

interface AuthState {
    userId: string;
    role: string;
    authenticated: boolean;
}

const initialState: AuthState = {
    userId: "",
    role: "",
    authenticated: false,
};

interface DecodedToken {
    nameid: string;
    role: string;
    exp?: number;
    iat?: number;
}

const authSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        // Initialize state from a JWT token
        initAuthState(state, action: PayloadAction<string>) {
            try {
                const decoded: DecodedToken = jwtDecode(action.payload);
                state.userId = decoded.nameid;
                state.role = decoded.role;
                state.authenticated = true;
            } catch (err) {
                console.error("Invalid token", err);
                state.userId = "";
                state.role = "";
                state.authenticated = false;
            }
        },
        resetAuthState: () => initialState,
    },
});


export const selectRole = (state: RootState) => {
    return state.authReducer.role;
}

export const selectUserId = (state: RootState) => {
    return state.authReducer.userId;
}

export const { initAuthState, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
