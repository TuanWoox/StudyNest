import { useState } from "react";
import { SortOrderType } from "@/constants/sortOrderType";

const DEFAULT_PAGE_SIZE = 10;

export const useTableControls = () => {
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sorts, setSorts] = useState<Array<{ sort: string; sortDir: SortOrderType }>>([]);
    const [filters, setFilters] = useState<Array<{ prop: string; value: string }>>([]);

    // ------ Tạo filter dropdown dùng chung (với kiểu chính xác) ------
    const handleTableChange = (pagination, tableFilters, sorter) => {
        // Pagination
        setPageNumber(pagination.current - 1);
        setPageSize(pagination.pageSize);

        // Sorting
        if (sorter.order) {
            setSorts([
                {
                    sort: sorter.field,
                    sortDir: sorter.order === "ascend" ? SortOrderType.ASC : SortOrderType.DESC,
                },
            ]);
        }

        // Filters
        const nextFilters: Array<{ prop: string; value: string }> = [];
        Object.keys(tableFilters).forEach((key) => {
            console.log(tableFilters);
            const val = tableFilters[key]?.[0];
            if (val) nextFilters.push({ prop: key, value: val });
        });
        setFilters(nextFilters);
    };

    return {
        pageNumber,
        pageSize,
        sorts,
        filters,
        setPageNumber,
        setPageSize,
        setSorts,
        setFilters,
        handleTableChange,
    };
};
