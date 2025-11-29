import feedbackService from "@/services/feedbackService";
import { Page } from "@/types/common/page";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useDeleteSelectedFeedbacks = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<number, AxiosError, Page<string>>({
        mutationKey: ["deleteFeedbacks"],
        mutationFn: async (payload) => {
            const deletedCount = await feedbackService.deleteFeedBacks(payload);
            if (deletedCount <= 0) throw new Error("Delete failed");
            return deletedCount;
        },
        onSuccess: (deletedCount) => {
            queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
            toast.success(`${deletedCount} feedback(s) deleted successfully`);
        },
        onError: (err) => {
            console.log("err", err);
            toast.error(err?.message ?? "Failed to delete feedback(s)");
        },
    });

    return {
        deleteFeedbacks: mutation.mutate,
        deleteFeedbacksAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

export default useDeleteSelectedFeedbacks;
