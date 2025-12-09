import { useQuery } from "@tanstack/react-query";
import quizSessionService from "@/services/quizSessionService";

export const useGetActiveQuizSession = (quizId: string, enabled = true) => {
  const {
    data: activeSession,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["active-quiz-session", quizId],
    queryFn: () => quizSessionService.getActiveQuizSession(quizId),
    enabled: enabled && !!quizId,
    staleTime: 0,
    refetchOnMount: true,
  });

  return {
    activeSession,
    isLoading,
    error,
    refetch,
  };
};
