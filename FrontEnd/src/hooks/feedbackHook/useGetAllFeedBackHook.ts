import { StudyNestFilterType } from "@/constants/filterType";
import { SortOrderType } from "@/constants/sortOrderType";
import feedbackService from "@/services/feedbackService";
import { Page } from "@/types/common/page";
import { PagedData } from "@/types/common/paged-data";
import { SelectFeedBackDTO } from "@/types/feedback/selectFeedBackDTO";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UseGetAllFeedBackOptions {
    enabled?: boolean;
    pageSize?: number;
    pageNumber?: number;

    // thêm sort/filter
    sorts?: Array<{
        sort: string;
        sortDir: SortOrderType;
    }>;

    filters?: Array<{
        prop: string;
        value: string;
        filterOperator?: string;
        filterType?: StudyNestFilterType;
    }>;
}

const useGetAllFeedBackHook = (options?: UseGetAllFeedBackOptions) => {
    const enabled = options?.enabled ?? true;
    const pageSize = options?.pageSize ?? 10;
    const pageNumber = options?.pageNumber ?? 0;
    return useQuery<PagedData<SelectFeedBackDTO, string>, AxiosError>({
        queryKey: ["feedbacks", options],   // <--- track filters + sorts
        enabled,
        queryFn: async () => {
            const payload: Page<string> = {
                size: pageSize,
                pageNumber,
                totalElements: 0,
                orders: options?.sorts?.map(s => ({
                    sort: s.sort,
                    sortDir: s.sortDir,
                    dataType: "",
                    delimiter: "",
                    dynamicProperty: "",
                })) ?? [],

                filter: options?.filters?.map(f => ({
                    prop: f.prop,
                    value: f.value,
                    filterOperator: f.filterOperator ?? "Contains",
                    filterType: f.filterType ?? StudyNestFilterType.Text,
                    delimiter: "",
                    dynamicProperty: ""
                })) ?? [],

                selected: [],
            };
            return await feedbackService.getAllFeedBack(payload);
        },

        gcTime: 10 * 60 * 1000,
    });
}

export default useGetAllFeedBackHook;