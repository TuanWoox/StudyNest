import instance from "@/config/axiosConfig"
import { ReturnResult } from "@/types/common/return-result"
import { QuizStatisticsDTO } from "@/types/quizStatistics/QuizStatisticsDTO"
import { Dayjs } from "dayjs"

const quizStatisticsService = {
    getOneById: async (quizId: string, dateFilterRaw: [Dayjs | null, Dayjs | null]) => {
        const dateFilter = {
            dateFrom: dateFilterRaw?.[0] || null,
            dateTo: dateFilterRaw?.[1] || null
        }
        const { data } = await instance.post<ReturnResult<QuizStatisticsDTO>>(`/QuizStatistics/${quizId}`, dateFilter)
        return data;
    }
}


export default quizStatisticsService;