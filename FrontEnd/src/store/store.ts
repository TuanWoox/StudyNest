import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import quizAttemptReducer from "./quizAttemptSlice";
import authReducer from "./authSlice";
import quizJobReducer from "./quizJobSlice";
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    quizAttempt: quizAttemptReducer,
    authReducer: authReducer,
    quizJob: quizJobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
