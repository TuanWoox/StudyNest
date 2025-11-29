import { BaseEntity } from "../common/baseEntity";

export interface selectQuizAttemptDTO extends BaseEntity<string> {
    quizId: string;
    userId: string;
    quizAttemptSnapshotId: string;
    endTime: string;
    score: number;
    isCompleted: boolean;
}
