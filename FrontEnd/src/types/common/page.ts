import { SortOrderType } from "@/constants/sortOrderType";
import { StudyNestFilterType } from "@/constants/filterType";

export interface OrderMapping {
    sort: string;
    sortDir: SortOrderType;
    dynamicProperty: string;
    delimiter: string;
    dataType: string;
}

export interface FilterMapping {
    prop: string;
    value: any;
    filterOperator: any;
    filterType: StudyNestFilterType;
    dynamicProperty: string;
    delimiter: string;
}

export interface Page<T> {
    size: number;
    pageNumber: number;
    totalElements: number;
    orders?: OrderMapping[];
    filter?: FilterMapping[];
    selected?: T[];
}
