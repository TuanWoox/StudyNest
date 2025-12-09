import instance from "@/config/axiosConfig"
import { ReturnResult } from "@/types/common/return-result"
import { QuizSessionDTO } from "@/types/quizSession/quizSession"
import { CreateQuizSessionDTO } from "@/types/quizStatistics/CreateQuizSession"

const quizSessionService = {
    async getQuizSessionId(quizSessionId: string) {
        const { data } = await instance.get<ReturnResult<QuizSessionDTO>>(`/QuizSession/${quizSessionId}`)
        return data.result;
    },
    async startQuizSession (quizSessionId: string) {
        const { data } = await instance.put<ReturnResult<boolean>>(`/QuizSession/Start/${quizSessionId}`)
        return data.result;
    },
    async createQuizSession (createQuizSession: CreateQuizSessionDTO) {
        const { data } = await instance.post<ReturnResult<QuizSessionDTO>>(`/QuizSession`, createQuizSession);
        return data.result;
    },
    async getActiveQuizSession (quizId: string) {
        const { data } = await instance.get<ReturnResult<QuizSessionDTO>>(`QuizSession/GetActiveQuizSession/${quizId}`)
        return data.result;
    },
    async terminateQuizSession (id: string) {
        const { data } = await instance.put<ReturnResult<boolean>>(`QuizSession/Terminate/${id}`)
        return data.result;
    }
}

export default quizSessionService;