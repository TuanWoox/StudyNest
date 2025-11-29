import quizStatisticsService from "@/services/quizStatisticsService"
import { useQuery } from "@tanstack/react-query"
import { Dayjs } from "dayjs";

const useGetOneStatisticsByQuizId = (quizId: string, dateFilterRaw: [Dayjs | null, Dayjs | null], options?: { enabled?: boolean }) => {
    const enabled = options?.enabled ?? true;
    return useQuery({
        queryKey: ["statistics", quizId, dateFilterRaw],
        queryFn: () => quizStatisticsService.getOneById(quizId, dateFilterRaw),
        enabled: enabled
    })
}

export default useGetOneStatisticsByQuizId;