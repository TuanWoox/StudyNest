import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import quizAttemptService from "@/services/quizAttemptService";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";

export const useSubmitAnswerForQuizSession = () => {
    const mutation = useMutation<QuizAttemptAnswerDTO, AxiosError, CreateQuizAttemptAnswerDTO>({
        mutationKey: ["submitAnswerForQuizSession"],
        mutationFn: (submittedAnswer) => quizAttemptService.submitQuizAnswerForQuizSession(submittedAnswer),
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
