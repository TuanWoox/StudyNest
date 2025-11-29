import feedbackService from "@/services/feedbackService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useDeleteFeedback = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<boolean, AxiosError, string>({
        mutationKey: ["deleteFeedback"],
        mutationFn: async (feedbackId) => {
            const ok = await feedbackService.deleteFeedBack(feedbackId);
            if (!ok) throw new Error("Delete failed");
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
            toast.success("Feedback deleted successfully");
        },
        onError: (err) => {
            console.error("Error deleting feedback:", err);
            toast.error(err?.message ?? "Failed to delete feedback");
        },
    });

    return {
        deleteFeedback: mutation.mutate,
        deleteFeedbackAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

export default useDeleteFeedback;
