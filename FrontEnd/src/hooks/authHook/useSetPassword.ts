import authService from "@/services/authService";
import { UserSetPassword } from "@/types/auth/userChangePassword";
import { ReturnResult } from "@/types/common/return-result";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

const useSetPassword = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ReturnResult<boolean>, AxiosError, UserSetPassword>({
        mutationKey: ["setPassword"],
        mutationFn: (payload) => {
            const result = authService.setPassword(payload);
            return result;
        },
        onSuccess: (result) => {
            if (!result.message) {
                toast.success("Password successfully changed!");
            };
            queryClient.invalidateQueries({ queryKey: ["hasPassword"] });
        },
        onError: (err) => {
            console.log("err", err);
        },
    });

    return {
        setPassword: mutation.mutate,
        setPasswordAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useSetPassword;