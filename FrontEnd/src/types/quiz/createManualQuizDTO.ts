import { QuestionUpsertDTO } from "../question/questionUpsertDTO";

export interface CreateManualQuizDTO {
  title: string;
  difficulty: string;
  questions: QuestionUpsertDTO[];
}
