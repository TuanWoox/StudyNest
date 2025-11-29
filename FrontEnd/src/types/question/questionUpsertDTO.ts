import { ChoiceDTO } from "./createQuestionDTO";

export interface QuestionUpsertDTO {
  id?: string;
  name: string;
  type: "MCQ" | "MSQ" | "TF";
  explanation?: string;
  choices: ChoiceDTO[];
}
