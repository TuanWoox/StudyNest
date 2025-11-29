import { useMutation, useQueryClient } from "@tanstack/react-query";
import quizService from "@/services/quizService";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { CreateManualQuizDTO } from "@/types/quiz/createManualQuizDTO";
import { useNavigate } from "react-router-dom";

interface UseCreateManualQuizOptions {
  onSuccess?: (quizId: string) => void;
  onError?: (error: unknown) => void;
}

const useCreateManualQuiz = (options?: UseCreateManualQuizOptions) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { onSuccess, onError } = options || {};

  const mutation = useMutation<string, AxiosError, CreateManualQuizDTO>({
    mutationKey: ["createManualQuiz"],
    mutationFn: async (payload: CreateManualQuizDTO) => {
      const result = await quizService.createManualQuiz(payload);
      if (!result) throw new Error("Create failed.");
      return result;
    },
    onSuccess: (quizId) => {
      toast.success("Quiz created successfully");
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      navigate(`/user/quiz/${quizId}`);
      onSuccess?.(quizId);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    createManualQuiz: mutation.mutate,
    createManualQuizAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};

export default useCreateManualQuiz;