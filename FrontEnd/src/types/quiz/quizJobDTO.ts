export interface QuizJobDTO {
  jobId: string;
  userId: string;
  noteTitle: string;
  status: string;
  quizId?: string;
  errorMessage?: string;
  timestamp: string;
  isViewed: boolean;
  createdAt: string;
}
