import instance from "@/config/axiosConfig";
import { Page } from "@/types/common/page";
import { PagedData } from "@/types/common/paged-data";
import { ReturnResult } from "@/types/common/return-result";
import { QuizAttemptDTO } from "@/types/quizAttempt/quizAttemptDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { selectQuizAttemptDTO } from "@/types/quizAttemptAnswer/selectQuizAttemptDTO";

const quizAttemptService = {

    getOneById: async (quizAttemptId: string) => {
        const { data } = await instance.get<ReturnResult<QuizAttemptDTO>>(`/QuizAttempt/${quizAttemptId}`);
        return data.result;
    },

    submitQuizAttempt: async (quizAttemptSnapshotId: string, submittedAnswers: CreateQuizAttemptAnswerDTO[]) => {
        const { data } = await instance.post<ReturnResult<string>>(`/QuizAttempt/SubmitQuizAttempt/${quizAttemptSnapshotId}`, submittedAnswers);
        return data.result;
    },

    getAllQuizAttempts: async (
        payload: Page<string>, quizId: string
    ): Promise<PagedData<selectQuizAttemptDTO, string>> => {
        const { data } = await instance.post<
        ReturnResult<PagedData<selectQuizAttemptDTO, string>>
        >(`/QuizAttempt/GetPagingByQuizId?quizId=${quizId}`, payload);
        return data.result;
    },
}

export default quizAttemptService;