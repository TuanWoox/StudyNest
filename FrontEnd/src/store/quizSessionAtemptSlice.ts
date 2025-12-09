import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { QuestionDTO } from "@/types/question/questionDTO";
import { QuizAttemptDTO } from "@/types/quizAttempt/quizAttemptDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";

interface QuizSessionAttemptState {
    currentAnswer: CreateQuizAttemptAnswerDTO | null;
    questions: QuestionDTO[];
    currentQuestionIndex: number;
    isJoined: boolean;
    players: string[];
    isLoadingPrepare: boolean;
    quizAttempt: QuizAttemptDTO | null;
    submitResult: QuizAttemptAnswerDTO | undefined;
    isTimeUp: boolean;
    quizSessionAttemptsEnded: QuizAttemptDTO[] | null;
}

const initialState: QuizSessionAttemptState = {
    currentAnswer: null,
    questions: [],
    currentQuestionIndex: 0,
    isJoined: false,
    players: [],
    isLoadingPrepare: false,
    quizAttempt: null,
    submitResult: undefined,
    isTimeUp: false,
    quizSessionAttemptsEnded: null,
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
            state.isTimeUp = false;
        },
        setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
            if (action.payload >= 0 && action.payload < state.questions.length) {
                state.currentQuestionIndex = action.payload;
                // Reset answer when moving to a new question
                state.currentAnswer = null;
                state.isTimeUp = false;
            }
        },
        moveToNextQuestion: (state) => {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                state.currentQuestionIndex += 1;
                // Reset answer for the new question
                state.currentAnswer = null;
                state.isTimeUp = false;
            }
        },
        setAnswer: (state, action: PayloadAction<CreateQuizAttemptAnswerDTO>) => {
            state.currentAnswer = action.payload;
        },
        clearAnswer: (state) => {
            state.currentAnswer = null;
        },
        setIsJoined: (state, action: PayloadAction<boolean>) => {
            state.isJoined = action.payload;
        },
        setPlayers: (state, action: PayloadAction<string[]>) => {
            state.players = action.payload;
        },
        setIsLoadingPrepare: (state, action: PayloadAction<boolean>) => {
            state.isLoadingPrepare = action.payload;
        },
        setQuizAttempt: (state, action: PayloadAction<QuizAttemptDTO | null>) => {
            state.quizAttempt = action.payload;
        },
        setSubmitResult: (state, action: PayloadAction<QuizAttemptAnswerDTO | undefined>) => {
            state.submitResult = action.payload;
        },
        setIsTimeUp: (state, action: PayloadAction<boolean>) => {
            state.isTimeUp = action.payload;
        },
        setQuizSessionAttemptsEnded: (state, action: PayloadAction<QuizAttemptDTO[] | null>) => {
            state.quizSessionAttemptsEnded = action.payload;
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

// Selector for isJoined
export const selectIsJoined = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.isJoined
);

// Selector for players
export const selectPlayers = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.players
);

// Selector for isLoadingPrepare
export const selectIsLoadingPrepare = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.isLoadingPrepare
);

// Selector for quizAttempt
export const selectQuizAttempt = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.quizAttempt
);

// Selector for submitResult
export const selectSubmitResult = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.submitResult
);

// Selector for isTimeUp
export const selectIsTimeUp = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.isTimeUp
);

// Selector for quizSessionAttemptsEnded
export const selectQuizSessionAttemptsEnded = createSelector(
    [selectQuizSessionAttempt],
    (state) => state.quizSessionAttemptsEnded
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
    setIsJoined,
    setPlayers,
    setIsLoadingPrepare,
    setQuizAttempt,
    setSubmitResult,
    setIsTimeUp,
    setQuizSessionAttemptsEnded,
    resetState,
} = quizSessionAttemptSlice.actions;

export default quizSessionAttemptSlice.reducer;
