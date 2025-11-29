import { useMutation, useQueryClient } from "@tanstack/react-query";
import quizService from "@/services/quizService";
import type { AxiosError } from "axios";

interface UseValidateNoteLengthOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useValidateNoteLength = (options?: UseValidateNoteLengthOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options || {};

  const mutation = useMutation<boolean, AxiosError, string>({
    mutationKey: ["validateNoteLength"],
    mutationFn: async (noteId: string) => {
      const ok = await quizService.validateNoteLength(noteId);
      return ok;  
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    validateNoteLength: mutation.mutate,
    validateNoteLengthAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
};

export default useValidateNoteLength;
