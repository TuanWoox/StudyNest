import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import authService from "@/services/authService";
import { ReturnResult } from "@/types/common/return-result";
import { ResetPasswordDTO } from "@/types/auth/ResetPasswordDTO";

const useResetPassword = () => {
    const mutation = useMutation<ReturnResult<boolean>, AxiosError, ResetPasswordDTO>({
        mutationKey: ["auth", "resetPassword"],
        mutationFn: (payload: ResetPasswordDTO) => {
            const result = authService.resetPassword(payload);
            return result
        },
        onSuccess: (result) => {
            if (!result.message) {
                toast.success("Password has been reset. Redirecting to login...");
            }
        },
        onError: (err) => {
            console.log("err", err);
        },
    });

    return {
        resetPassword: mutation.mutate,
        resetPasswordAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
};

export default useResetPassword;