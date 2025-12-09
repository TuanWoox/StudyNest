import { BaseEntity } from "../common/baseEntity";
import { QuizAttemptAnswerDTO } from "../quizAttemptAnswer/quizAttemptAnswerDTO";
import { QuizAttemptSnapshotDTO } from "../quizAttemptSnapshot/quizAttemptSnapshotDTO";

export interface QuizAttemptDTO extends BaseEntity<string> {
    quizId: string,
    userId: string,
    user: UserDTO
    quizAttemptSnapshotId: string,
    quizAttemptSnapshot: QuizAttemptSnapshotDTO,
    score: number,
    isCompleted: boolean,
    quizAttemptAnswers: QuizAttemptAnswerDTO[]
}

export interface UserDTO {
    id: string;
    email: string;
    userName: string;
}