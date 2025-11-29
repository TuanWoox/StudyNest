import instance from "@/config/axiosConfig";
import { ReturnResult } from "@/types/common/return-result";
import { QuizJob } from "@/store/quizJobSlice";
import { QuizJobDTO } from "@/types/quiz/quizJobDTO";

const quizJobService = {
  getProcessingJobs: async (): Promise<QuizJob[]> => {
    const { data } = await instance.get<ReturnResult<QuizJobDTO[]>>(
      "/QuizJob/processing"
    );

    if (!data.result) return [];

    return data.result.map((dto) => ({
      jobId: dto.jobId,
      noteTitle: dto.noteTitle,
      timestamp: dto.timestamp,
      status: dto.status as "processing" | "success" | "error",
      quizId: dto.quizId,
      errorMessage: dto.errorMessage,
      isViewed: dto.isViewed,
      createdAt: new Date(dto.timestamp).getTime(),
    }));
  },

  getRecentJobs: async (sinceEpochMs: number): Promise<QuizJob[]> => {
    const { data } = await instance.get<ReturnResult<QuizJobDTO[]>>(
      `/QuizJob/recent?sinceEpochMs=${sinceEpochMs}`
    );

    if (!data.result) return [];

    return data.result.map((dto) => ({
      jobId: dto.jobId,
      noteTitle: dto.noteTitle,
      timestamp: dto.timestamp,
      status: dto.status as "processing" | "success" | "error",
      quizId: dto.quizId,
      errorMessage: dto.errorMessage,
      isViewed: dto.isViewed,
      createdAt: new Date(dto.timestamp).getTime(),
    }));
  },
};

export default quizJobService;
