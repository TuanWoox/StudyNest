import { QuestionUpsertDTO } from "../question/questionUpsertDTO";

export interface UpdateQuizDTO {
  id: string;
  title: string;
  dateCreated?: string;
  dateModified?: string;
  deleted?: boolean;
  questions: QuestionUpsertDTO[];
}
