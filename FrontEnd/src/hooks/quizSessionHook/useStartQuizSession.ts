import quizSessionService from "@/services/quizSessionService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useStartQuizSession = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<boolean, AxiosError, string>({
        mutationKey: ["startQuizSession"],
        mutationFn: (quizSessionId: string) => quizSessionService.startQuizSession(quizSessionId),
        onSuccess: (data, quizSessionId) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["quizsession", quizSessionId] });
                toast.success("Quiz session started successfully");
            }
        },
        onError: (err) => {
            console.error("Start quiz session error:", err);
            toast.error("Failed to start quiz session");
        },
    });

    return {
        startQuizSession: mutation.mutate,
        startQuizSessionAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
    };
};

export default useStartQuizSession;
