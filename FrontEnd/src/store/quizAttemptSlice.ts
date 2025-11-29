import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import getQuizData from "@/utils/getQuizData";
import getQuizSnapshot from "@/utils/getQuizSnapshot";

interface QuizAttemptState {
    createQuizAttemptAnswerList: CreateQuizAttemptAnswerDTO[];
    quizAttemptSnapshotId: string;
    questionId: string;
    quizAttemptSnapshot: string;
    isNeededToSubmit: boolean;
}

const initialState: QuizAttemptState = {
    createQuizAttemptAnswerList: [],
    quizAttemptSnapshotId: "",
    questionId: "",
    quizAttemptSnapshot: "",
    isNeededToSubmit: false
};

const quizAttemptSlice = createSlice({
    name: "quizAttempt",
    initialState,
    reducers: {
        initState: (state, action: PayloadAction<QuizAttemptState>) => {
            return action.payload ?? initialState;
        },
        addAnswer: (state, action: PayloadAction<CreateQuizAttemptAnswerDTO>) => {
            const newAnswer = { ...action.payload, quizAttemptId: "" };
            const filteredAnswers = state.createQuizAttemptAnswerList?.filter(
                answer => answer?.snapShotQuestionId !== newAnswer?.snapShotQuestionId
            ) ?? [];
            state.createQuizAttemptAnswerList = [...(filteredAnswers ?? []), newAnswer];
        },
        removeAnswer: (state, action: PayloadAction<string>) => {
            state.createQuizAttemptAnswerList = state.createQuizAttemptAnswerList?.filter(
                x => x?.snapShotQuestionId !== action.payload
            ) ?? [];
        },
        //This is for Sequential View
        nextQuestion: (state) => {
            const snapshot = getQuizSnapshot(state?.quizAttemptSnapshot);
            const questions = snapshot?.quizQuestionsParsed;
            if (!questions?.length) return;

            const currentIndex = questions?.findIndex(
                q => q?.id === state?.questionId
            );

            if (currentIndex !== undefined && currentIndex >= 0 && currentIndex < questions?.length - 1) {
                state.questionId = questions?.[currentIndex + 1]?.id ?? "";
            }
        },
        //This is for Sequential View
        previousQuestion: (state) => {
            const snapshot = getQuizSnapshot(state?.quizAttemptSnapshot);
            const questions = snapshot?.quizQuestionsParsed;
            if (!questions?.length) return;

            const currentIndex = questions?.findIndex(
                q => q?.id === state?.questionId
            );

            if (currentIndex !== undefined && currentIndex > 0) {
                state.questionId = questions?.[currentIndex - 1]?.id ?? "";
            }
        },
        //This is for Free Navigation Quiz View
        selectQuestion: (state, action: PayloadAction<string>) => {
            const snapshot = getQuizSnapshot(state?.quizAttemptSnapshot);
            const questions = snapshot?.quizQuestionsParsed;
            if (!questions?.length) return;

            const selectIndex = questions?.findIndex(q => q?.id === action.payload);

            if (selectIndex !== undefined && selectIndex >= 0 && selectIndex < questions?.length) {
                state.questionId = questions?.[selectIndex]?.id ?? "";
            }
        },
        triggerSubmit: (state) => {
            state.isNeededToSubmit = true;
        },
        resetState: () => initialState,
    },
});


// Selector to get the entire quiz attempt state
export const selectQuizAttempt = (state: RootState): QuizAttemptState =>
    state?.quizAttempt ?? initialState;

// Using createSelector to memoize data
export const selectQuizNavigation = createSelector(
    [getQuizData],
    (data) => {
        if (!data) {
            return {
                isLastQuestion: false,
                isFirstQuestion: false,
            };
        }

        const { questions, currentQuestionIndex } = data;

        return {
            isLastQuestion: currentQuestionIndex === (questions?.length ?? 0) - 1,
            isFirstQuestion: currentQuestionIndex === 0,
        };
    }
);

// Using createSelector to memoize data
export const selectQuizProgress = createSelector(
    [getQuizData],
    (data) => {
        if (!data) {
            return {
                currentQuestionIndex: -1,
                answeredCount: 0,
                progressPercentage: 0,
                totalQuestions: 0,
            };
        }

        const { questions, currentQuestionIndex, answeredList } = data;
        const answeredQuestionIds = new Set(
            answeredList?.map((answer) => answer?.snapShotQuestionId) ?? []
        );
        const answeredCount = answeredQuestionIds?.size ?? 0;
        const progressPercentage =
            (questions?.length ?? 0) > 0
                ? (answeredCount / (questions?.length ?? 1)) * 100
                : 0;

        return {
            currentQuestionIndex: currentQuestionIndex ?? -1,
            answeredCount,
            progressPercentage,
            totalQuestions: questions?.length ?? 0,
        };
    }
);

// Using createSelector to memoize data
export const selectQuizCard = createSelector(
    [getQuizData],
    (data) => {
        if (!data) {
            return {
                currentQuestion: null,
                currentAnswer: undefined,
            };
        }

        return {
            currentQuestion: data?.currentQuestion ?? null,
            currentAnswer: data?.currentAnswer,
        };
    }
);

export const selectIsNeededToSubmitQuiz = (state: RootState) => state.quizAttempt.isNeededToSubmit;

export const selectQuestionsAndAnswerList = createSelector(
    [getQuizData],
    (data) => {
        if (!data) {
            return {
                questions: [],
                answeredList: [],
            }
        }
        const { questions, answeredList } = data;
        return {
            questions,
            answeredList,
        }
    }
)


export const {
    initState,
    addAnswer,
    nextQuestion,
    previousQuestion,
    selectQuestion,
    resetState,
    removeAnswer,
    triggerSubmit
} = quizAttemptSlice.actions;

export default quizAttemptSlice.reducer;
