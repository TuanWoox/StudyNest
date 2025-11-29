import feedbackService from "@/services/feedbackService";
import { FeedBackDTO } from "@/types/feedback/feedBackDTO";
import { UpdateFeedBackDTO } from "@/types/feedback/updateFeedBackDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useUpdateFeedback = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<FeedBackDTO, AxiosError, UpdateFeedBackDTO>({
        mutationKey: ["updateFeedback"],
        mutationFn: (payload) => feedbackService.updateFeedBack(payload),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
                toast.success("Feedback successfully updated!");
            }
        },
        onError: (err) => {
            console.error("Error updating feedback:", err);
            toast.error(err?.message ?? "Failed to update feedback");
        },
    });

    return {
        updateFeedback: mutation.mutate,
        updateFeedbackAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useUpdateFeedback;
