import settingService from "@/services/settingService";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

const useDeleteSetting = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<boolean, AxiosError, string>({
        mutationKey: ["deleteSetting"],
        mutationFn: async (settingId) => {
            const ok = await settingService.deleteSetting(settingId);
            if (!ok) throw new Error("Delete failed");
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            toast.success("Setting deleted successfully");
        },
        onError: (err) => {
            console.log("err", err);
            toast.error(err?.message ?? "Failed to delete setting");
        },
    });

    return {
        deleteSetting: mutation.mutate,
        deleteSettingAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
};

export default useDeleteSetting;