import quizSessionService from "@/services/quizSessionService"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { QuizSessionDTO } from "@/types/quizSession/quizSession"

const useGetQuizSessionById = (
    quizSessionId: string | undefined,
    options?: Omit<UseQueryOptions<QuizSessionDTO>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ["quizsession", quizSessionId],
        queryFn: () => quizSessionService.getQuizSessionId(quizSessionId!),
        enabled: !!quizSessionId,
        ...options
    })
}

export default useGetQuizSessionById;