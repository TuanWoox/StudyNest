import { useMutation, useQueryClient } from "@tanstack/react-query";
import quizSessionService from "@/services/quizSessionService";
import { message } from "antd";

export const useTerminateQuizSession = () => {
  const queryClient = useQueryClient();

  const {
    mutate: terminateQuizSession,
    mutateAsync: terminateQuizSessionAsync,
    data,
    isPending: isLoading,
  } = useMutation({
    mutationFn: (quizSessionId: string) =>
      quizSessionService.terminateQuizSession(quizSessionId),
    onSuccess: () => {
      message.success("Quiz session terminated successfully");
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-quiz-session"] });
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Failed to terminate quiz session"
      );
    },
  });

  return {
    terminateQuizSession,
    terminateQuizSessionAsync,
    data,
    isLoading,
  };
};
