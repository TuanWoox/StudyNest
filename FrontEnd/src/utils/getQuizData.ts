import { RootState } from "@/store/store";
import getQuizSnapshot from "./getQuizSnapshot";

// Helper function to get common quiz data for reducer selector
const getQuizData = (state: RootState) => {
    const snapshot = getQuizSnapshot(state?.quizAttempt?.quizAttemptSnapshot);
    const questions = snapshot?.quizQuestionsParsed ?? [];
    if (!snapshot || !questions?.length) return null;

    const currentQuestionIndex = questions?.findIndex(
        q => q?.id === state?.quizAttempt?.questionId
    );
    const currentQuestion = currentQuestionIndex !== undefined && currentQuestionIndex >= 0
        ? questions?.[currentQuestionIndex]
        : null;
    const currentAnswer = state?.quizAttempt?.createQuizAttemptAnswerList?.find(
        answer => answer?.snapShotQuestionId === currentQuestion?.id
    );

    return {
        questions,
        currentQuestionIndex: currentQuestionIndex ?? -1,
        currentQuestion,
        currentAnswer,
        answeredList: state?.quizAttempt?.createQuizAttemptAnswerList ?? []
    };
};

export default getQuizData;