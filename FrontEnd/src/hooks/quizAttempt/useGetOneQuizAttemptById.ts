import quizAttemptService from "../../services/quizAttemptService";
import { useQuery } from "@tanstack/react-query";

const useGetOneQuizAttemptById = (quizAttemptId?: string, options?: { enabled?: boolean }) => {
    const enabled = options?.enabled ?? !!quizAttemptId;
    return useQuery({
        queryKey: ["quizAttempt", quizAttemptId],
        queryFn: () => quizAttemptService.getOneById(quizAttemptId!),
        enabled,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

export default useGetOneQuizAttemptById;