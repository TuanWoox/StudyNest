import folderService from "@/services/folderService";
import { UpdateFolderDTO, Folder } from "@/types/note/notes";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

const useUpdateFolder = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<Folder, AxiosError, UpdateFolderDTO>({
        mutationKey: ["updateFolder"],
        mutationFn: (payload) => folderService.updateFolder(payload),
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["folders"] });
                queryClient.invalidateQueries({ queryKey: ["notes"] });
                queryClient.invalidateQueries({ queryKey: ["tags"] });
                toast.success("Folder successfully updated!");
            }
        },
        onError: (err) => {
            console.log("err", err);
            toast.error(err?.message ?? "Failed to update folder");
        },
    });

    return {
        updateFolder: mutation.mutate,
        updateFolderAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

export default useUpdateFolder;