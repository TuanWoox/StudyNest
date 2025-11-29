// src/hooks/useGetAllFolder.ts
import { useQuery } from "@tanstack/react-query";
import folderService from "@/services/folderService";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import { PagedData } from "@/types/common/paged-data";
import { Folder } from "@/types/note/notes";
import type { AxiosError } from "axios";
import { StudyNestFilterType } from "@/constants/filterType";

interface UseGetAllFolderOptions {
    enabled?: boolean;
    sortByNewest?: boolean;
    pageSize?: number;
    pageNumber?: number;
    searchTerm?: string;
}

/**
 * Hook to fetch paginated folder list
 */
const useGetAllFolder = (options?: UseGetAllFolderOptions) => {
    const enabled = options?.enabled ?? true;
    const sortByNewest = options?.sortByNewest ?? true;
    const pageSize = options?.pageSize ?? -1; // -1 để lấy tất cả folder nếu muốn
    const pageNumber = options?.pageNumber ?? 0;
    const searchTerm = options?.searchTerm ?? "";

    return useQuery<PagedData<Folder, string>, AxiosError>({
        queryKey: ["folders", { pageNumber, pageSize, sortByNewest, searchTerm }],
        enabled,
        queryFn: async () => {
            const payload: Page<string> = {
                size: pageSize,
                pageNumber: pageNumber,
                totalElements: 0,
                orders: sortByNewest
                    ? [
                        {
                            sort: "dateCreated",
                            sortDir: SortOrderType.DESC,
                            dynamicProperty: "",
                            delimiter: "",
                            dataType: "",
                        },
                    ]
                    : [],
                filter: searchTerm
                    ?
                    [{
                        prop: "folderName",
                        value: searchTerm,
                        filterOperator: "Contains",
                        filterType: StudyNestFilterType.Text,
                        dynamicProperty: "",
                        delimiter: "",
                    },]
                    : [],
                selected: [],
            };

            return await folderService.getAllFolder(payload);
        },
        gcTime: 10 * 60 * 1000,
    });
};

export default useGetAllFolder;
