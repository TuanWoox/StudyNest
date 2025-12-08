import instance from "@/config/axiosConfig"
import { ReturnResult } from "@/types/common/return-result"
import { QuizSessionDTO } from "@/types/quizSession/quizSession"

const quizSessionService = {
    async getQuizSessionId(quizSessionId: string) {
        const { data } = await instance.get<ReturnResult<QuizSessionDTO>>(`/QuizSession/${quizSessionId}`)
        return data.result;
    },
    async startQuizSession (quizSessionId: string) {
        const { data } = await instance.put<ReturnResult<boolean>>(`/QuizSession/Start/${quizSessionId}`)
        return data.result;
    }
}

export default quizSessionService;