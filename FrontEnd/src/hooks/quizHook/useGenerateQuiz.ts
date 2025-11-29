import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateQuizDTO } from "@/types/quiz/createQuizDTO";
import quizService from "@/services/quizService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UseGenerateQuizOptions {
  onError?: (error: any) => void;
  redirectOnSuccess?: boolean;
}

export const useGenerateQuiz = (options?: UseGenerateQuizOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { onError, redirectOnSuccess = true } = options || {};

  const mutation = useMutation<{ id: string }, unknown, CreateQuizDTO>({
    mutationKey: ["generateQuiz"],
    mutationFn: quizService.generateQuiz,
    onSuccess: ({ id }) => {
      toast.info("Quiz add to queue successfully!");
      queryClient.invalidateQueries({
        queryKey: ["quizzes"],
        refetchType: "inactive",
      });
      if (redirectOnSuccess) navigate(`/user/quiz`);
    },
    onError: (error) => onError?.(error),
  });

  return {
    generateQuiz: mutation.mutate,
    generateQuizAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

export default useGenerateQuiz;
