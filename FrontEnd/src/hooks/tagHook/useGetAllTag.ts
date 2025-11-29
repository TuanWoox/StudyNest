import { PagedData } from "@/types/common/paged-data";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Tag } from "@/types/note/notes";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import tagService from "@/services/tagService";
import { StudyNestFilterType } from "@/constants/filterType";

interface UseGetAllTagOptions {
    enabled?: boolean;
    sortByNewest?: boolean;
    pageSize?: number;
    pageNumber?: number;
    searchTerm?: string;
}

const useGetAllTag = (options?: UseGetAllTagOptions) => {
    const enabled = options?.enabled ?? true;
    const sortByNewest = options?.sortByNewest ?? true;
    const pageSize = options?.pageSize ?? -1; // để lấy tất cả tag
    const pageNumber = options?.pageNumber ?? 0;
    const searchTerm = options?.searchTerm ?? "";

    return useQuery<PagedData<Tag, string>, AxiosError>({
        queryKey: ["tags", { pageNumber, pageSize, sortByNewest, searchTerm }],
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
                    ] : [],
                filter: searchTerm
                    ?
                    [{
                        prop: "name",
                        value: searchTerm,
                        filterOperator: "Contains",
                        filterType: StudyNestFilterType.Text,
                        dynamicProperty: "",
                        delimiter: "",
                    },]
                    : [],
                selected: [],
            };

            return await tagService.getAllTag(payload);
        },
        gcTime: 10 * 60 * 1000,
    });
};

export default useGetAllTag;