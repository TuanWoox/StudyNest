import { EQuizSessionStatus } from "@/utils/enums/EQuizSessionStatus";

export interface QuizSessionDTO {
    id: string;
    gamePin: string;
    timeForEachQuestion: number;
    status: EQuizSessionStatus;
    ownerId: string;
    currentQuestionIndex: number;
    dateCreated: string;
}