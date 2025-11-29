import feedbackService from "@/services/feedbackService";
import { CreateFeedBackDTO } from "@/types/feedback/createFeedBackDTO";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useCreateFeedback = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<FeedBackDTO, AxiosError, CreateFeedBackDTO>({
        mutationKey: ["createFeedback"],
        mutationFn: (payload) => feedbackService.createFeedBack(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
            toast.success("Feedback successfully created!");
        },
        onError: (err) => {
            console.error("Error creating feedback:", err);
            toast.error(err?.message ?? "Failed to create feedback");
        },
    });

    return {
        createFeedback: mutation.mutate,
        createFeedbackAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useCreateFeedback;
