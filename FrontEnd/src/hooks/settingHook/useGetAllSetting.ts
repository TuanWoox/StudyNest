import { PagedData } from "@/types/common/paged-data";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import { StudyNestFilterType } from "@/constants/filterType";
import { SettingDTO } from "@/types/setting/settingDTO";
import settingService from "@/services/settingService";

interface UseGetAllSettingOptions {
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

const useGetAllSetting = (options?: UseGetAllSettingOptions) => {
    const enabled = options?.enabled ?? true;
    const pageSize = options?.pageSize ?? 10;
    const pageNumber = options?.pageNumber ?? 0;

    return useQuery<PagedData<SettingDTO, string>, AxiosError>({
        queryKey: ["settings", options],   // <--- track filters + sorts
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

            return await settingService.getAllSetting(payload);
        },

        gcTime: 10 * 60 * 1000,
    });
};


export default useGetAllSetting;