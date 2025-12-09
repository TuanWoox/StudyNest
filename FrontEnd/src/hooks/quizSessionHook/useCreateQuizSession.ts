import { useMutation, useQueryClient } from "@tanstack/react-query";
import quizSessionService from "@/services/quizSessionService";
import { CreateQuizSessionDTO } from "@/types/quizStatistics/CreateQuizSession";
import { toast } from "sonner";

const useCreateQuizSession = () => {
    const queryClient = useQueryClient();

    const { mutate, mutateAsync, data, isPending, isError, error } = useMutation({
        mutationFn: (createQuizSession: CreateQuizSessionDTO) => 
            quizSessionService.createQuizSession(createQuizSession),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
            toast.success("Quiz session created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to create quiz session");
        },
    });

    return {
        createQuizSession: mutate,
        createQuizSessionAsync: mutateAsync,
        data,
        isLoading: isPending,
        isError,
        error,
    };
};

export default useCreateQuizSession;
