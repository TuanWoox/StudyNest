import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import authService from "@/services/authService";
import { ReturnResult } from "@/types/common/return-result";

const useRequestPasswordReset = () => {
    const mutation = useMutation<ReturnResult<boolean>, AxiosError, string>({
        mutationKey: ["auth", "requestPasswordReset"],
        mutationFn: async (email: string) => {
            const res = await authService.requestPasswordReset(email);
            return res;
        },
        onSuccess: (res) => {
            if (!res.message) {
                toast.success("A password reset link has been successfully sent to your email address.");
            }
        },
        onError: (err) => {
            console.log("err", err);
        },
    });

    return {
        requestPasswordReset: mutation.mutate,
        requestPasswordResetAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};

export default useRequestPasswordReset;