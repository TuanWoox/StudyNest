import dayjs, { Dayjs } from "dayjs";

export const disabledFuture = (current?: Dayjs) => {
    if (!current) return false;
    return current.isAfter(dayjs(), "day"); // không chọn ngày tương lai
};

/**
 * Disable START date:
 * - Không được chọn ngày tương lai
 * - Nếu endDate tồn tại thì startDate không được > endDate
 */
export const getDisabledStartDate =
    (range: [Dayjs | null, Dayjs | null]) =>
        (current?: Dayjs) => {
            if (!current) return false;
            if (current.isAfter(dayjs(), "day")) return true;

            const end = range[1];
            return end ? current.isAfter(end, "day") : false;
        };

/**
* Disable END date:
* - Không được chọn ngày tương lai
* - Nếu startDate tồn tại thì endDate không được < startDate
*/
export const getDisabledEndDate =
    (range: [Dayjs | null, Dayjs | null]) =>
        (current?: Dayjs) => {
            if (!current) return false;
            if (current.isAfter(dayjs(), "day")) return true;

            const start = range[0];
            return start ? current.isBefore(start, "day") : false;
        };
