export interface CreateQuizSessionDTO {
    quizId: string;              // required
    gamePin: string;             // required, length 6
    timeForEachQuestion: number; // required, range 20–30
}
