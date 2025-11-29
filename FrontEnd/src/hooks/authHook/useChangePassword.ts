import authService from "@/services/authService";
import { UserChangePassword } from "@/types/auth/userChangePassword";
import { ReturnResult } from "@/types/common/return-result";
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

const useChangePassword = () => {

    const mutation = useMutation<ReturnResult<boolean>, AxiosError, UserChangePassword>({
        mutationKey: ["changePassword"],
        mutationFn: (payload) => {
            const result = authService.changePassword(payload)
            return result;
        },
        onSuccess: (result) => {
            if (!result.message) {
                toast.success("Password successfully changed!");
            }
        },
        onError: (err) => {
            console.log("err", err);
        },
    });

    return {
        changePassword: mutation.mutate,
        changePasswordAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useChangePassword;