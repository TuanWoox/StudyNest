import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom"; // <-- React Router
import quizAttemptService from "@/services/quizAttemptService";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { useReduxDispatch } from "../reduxHook/useReduxDispatch";
import { resetState } from "@/store/quizAttemptSlice";

type SubmitQuizAttemptVariables = {
    quizId: string;
    submittedAnswer: CreateQuizAttemptAnswerDTO[];
};

export const useSubmitQuizAttempt = () => {
    const navigate = useNavigate(); // <-- get navigate function
    const dispatch = useReduxDispatch();

    const mutation = useMutation<string, AxiosError, SubmitQuizAttemptVariables>({
        mutationKey: ["submitQuizAttempt"],
        mutationFn: ({ quizId, submittedAnswer }) =>
            quizAttemptService.submitQuizAttempt(quizId, submittedAnswer),
        onSuccess: (quizAttemptId) => {
            if (quizAttemptId) {
                // Navigate to a page after successful submission
                navigate(`/user/quiz/quizAttemptResult/${quizAttemptId}`);
                dispatch(resetState())
            }
        },
        onError: (err) => {
            console.error(err);
        },
    });

    return {
        submitAnswer: mutation.mutate,
        submitAnswerAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};
