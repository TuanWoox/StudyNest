export interface QuizList {
  id: string;
  title: string;
  totalQuestion: number;
  dateCreated: string;
  noteTitle: string;
  difficulty: string;
}

export interface QuizDetail {
  id: string;
  title: string;
  createdBy: string;
  difficulty: string;
  dateCreated: string;
  questions: Question[];
}

export interface Question {
  id: string;
  name: string;
  type: "MCQ" | "TF" | "MSQ";
  explanation: string;
  choices: Choice[];
}

export interface Choice {
  questionId: string;
  id: string;
  text: string;
  isCorrect: boolean;
}
