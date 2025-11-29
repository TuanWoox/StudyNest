import instance from "@/config/axiosConfig";
import { Page } from "@/types/common/page";
import { PagedData } from "@/types/common/paged-data";
import { ReturnResult } from "@/types/common/return-result";
import { CreateManualQuizDTO } from "@/types/quiz/createManualQuizDTO";
import { CreateQuizDTO } from "@/types/quiz/createQuizDTO";
import { QuizDetail, QuizList } from "@/types/quiz/quiz";
import { UpdateQuizDTO } from "@/types/quiz/updateQuizDTO";

interface GenerateQuizResult {
  id: string;
}

const quizService = {
  generateQuiz: async (payload: CreateQuizDTO): Promise<GenerateQuizResult> => {
    const { data } = await instance.post<ReturnResult<GenerateQuizResult>>(
      "/Quiz",
      payload
    );
    return data.result;
  },
  getQuizDetail: async (id: string): Promise<QuizDetail> => {
    const { data } = await instance.get<ReturnResult<QuizDetail>>(
      `/Quiz/${id}`
    );
    return data.result;
  },
  getAllQuiz: async (
    payload: Page<string>
  ): Promise<PagedData<QuizList, string>> => {
    const { data } = await instance.post<
      ReturnResult<PagedData<QuizList, string>>
    >("/Quiz/GetPaging", payload);
    return data.result;
  },
  createManualQuiz: async (payload: CreateManualQuizDTO): Promise<string> => {
    const {data} = await instance.post<ReturnResult<string>>(
      "/Quiz/manual", payload
    )

    return data.result;
  },
  updateQuiz: async (payload: UpdateQuizDTO): Promise<boolean> => {
    const { data } = await instance.put<ReturnResult<boolean>>(
      "/Quiz",
      payload
    );
    console.log("updateQuiz: " + JSON.stringify(data.result, null, 2));
    return data.result;
  },
  deleteQuiz: async (id: string): Promise<boolean> => {
    const { data } = await instance.delete<ReturnResult<boolean>>(
      `/Quiz/${id}`
    );
    return data.result === true;
  },
  validateNoteLength: async (nodeId: string): Promise<boolean> => {
    const { data } = await instance.get<ReturnResult<boolean>>(
      `/Quiz/validate-note-length?noteId=${nodeId}`
    );
    return data.result === true;
  }
};

export default quizService;
