import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { QuestionDTO } from "@/types/question/questionDTO";

interface QuizSessionAttemptState {
    currentAnswer: CreateQuizAttemptAnswerDTO | null;
    questions: QuestionDTO[];
    currentQuestionIndex: number;
}

const initialState: QuizSessionAttemptState = {
    currentAnswer: null,
    questions: [],
    currentQuestionIndex: 0,
};

const quizSessionAttemptSlice = createSlice({
    name: "quizSessionAttempt",
    initialState,
    reducers: {
        initState: (state, action: PayloadAction<Partial<QuizSessionAttemptState>>) => {
            return { ...initialState, ...action.payload };
        },
        setQuestions: (state, action: PayloadAction<QuestionDTO[]>) => {
            state.questions = action.payload;
            state.currentQuestionIndex = 0;
            state.currentAnswer = null;
        },
        setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
            if (action.payload >= 0 && action.payload < state.questions.length) {
                state.currentQuestionIndex = action.payload;
                // Reset answer when moving to a new question
                state.currentAnswer = null;
            }
        },
        moveToNextQuestion: (state) => {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                state.currentQuestionIndex += 1;
                // Reset answer for the new question
                state.currentAnswer = null;
            }
        },
        setAnswer: (state, action: PayloadAction<CreateQuizAttemptAnswerDTO>) => {
            state.currentAnswer = action.payload;
        },
        clearAnswer: (state) => {
            state.currentAnswer = null;
        },
        resetState: () => initialState,
    },
});

// Selector to get the entire quiz session attempt state
export const selectQuizSessionAttempt = (state: RootState): QuizSessionAttemptState => state?.quizSessionAttempt ?? initialState;

// Selector for current question
export const selectCurrentQuestion = createSelector(
    [selectQuizSessionAttempt],
    (state) => {
        if (!state.questions?.length || state.currentQuestionIndex < 0) {
            return null;
        }
        return state.questions[state.currentQuestionIndex] ?? null;
    }
);

// Selector for current answer
export const selectCurrentAnswer = createSelector(
    [selectQuizSessionAttempt],
    (state) => {
        return state.currentAnswer;
    }
);

// Selector for navigation state
export const selectQuizSessionNavigation = createSelector(
    [selectQuizSessionAttempt],
    (state) => {
        const totalQuestions = state.questions?.length ?? 0;
        return {
            isLastQuestion: state.currentQuestionIndex === totalQuestions - 1,
            isFirstQuestion: state.currentQuestionIndex === 0,
            canGoNext: state.currentQuestionIndex < totalQuestions - 1,
            totalQuestions,
        };
    }
);

// Selector for progress
export const selectQuizSessionProgress = createSelector(
    [selectQuizSessionAttempt],
    (state) => {
        const totalQuestions = state.questions?.length ?? 0;
        const hasAnswer = state.currentAnswer !== null;

        return {
            currentQuestionIndex: state.currentQuestionIndex,
            currentQuestionNumber: state.currentQuestionIndex + 1,
            hasCurrentAnswer: hasAnswer,
            totalQuestions,
        };
    }
);

// Selector for question card data
export const selectQuizSessionCard = createSelector(
    [selectCurrentQuestion, selectCurrentAnswer],
    (currentQuestion, currentAnswer) => {
        return {
            currentQuestion,
            currentAnswer,
        };
    }
);

export const {
    initState,
    setQuestions,
    setCurrentQuestionIndex,
    moveToNextQuestion,
    setAnswer,
    clearAnswer,
    resetState,
} = quizSessionAttemptSlice.actions;

export default quizSessionAttemptSlice.reducer;
