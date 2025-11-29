// quiz-statistics.dto.ts

import { QuestionDTO } from "../question/questionDTO";

export interface QuizStatisticsDTO {
    quizId: string;
    quizTitle: string;
    attemptSummary: QuizAttemptSummaryDTO;
    scoreStatistics: QuizScoreStatisticsDTO;
}

export interface QuizAttemptSummaryDTO {
    totalAttempts: number;
    firstAttemptDate?: Date;
    lastAttemptDate?: Date;
    scores: QuizScore[];
    totalRightQuestion: number;
    totalWrongQuestion: number;
    questionErrorCounts: QuestionErrorCount[];
}

export interface QuizScoreStatisticsDTO {
    bestScore: number;
    worstScore: number;
    averageScore: number;
    latestScore: number;
}

export interface QuestionErrorCount {
    question: QuestionDTO;
    wrongCounts: number;
}

export interface QuizScore {
    dateCreated: Date,
    score: number,
}