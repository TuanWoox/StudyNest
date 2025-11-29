import settingService from "@/services/settingService";
import { CreateSettingDTO } from "@/types/setting/createSettingDTO";
import { SettingDTO } from "@/types/setting/settingDTO";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

const useCreateSetting = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<SettingDTO, AxiosError, CreateSettingDTO>({
        mutationKey: ["createSetting"],
        mutationFn: (payload) => settingService.createSetting(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });

            toast.success("Setting successfully created!");
        },
        onError: (err) => {
            console.log("err", err);
            toast.error(err?.message ?? "Failed to create new setting");
        },
    });

    return {
        createSetting: mutation.mutate,
        createSettingAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useCreateSetting;