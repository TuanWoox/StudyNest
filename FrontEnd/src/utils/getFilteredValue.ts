export const getFilteredValue = (
    filters: { prop: string; value: string }[],
    prop: string
): string[] | null => {
    const found = filters.find((f) => f.prop === prop);
    return found ? [found.value] : null;
};
