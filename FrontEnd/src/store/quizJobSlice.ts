import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface QuizJob {
  jobId: string;
  noteTitle: string;
  timestamp: string;
  status: "processing" | "success" | "error";
  quizId?: string;
  errorMessage?: string;
  isViewed: boolean;
  createdAt: number;
}

const initialState: QuizJob[] = [];

const quizJobSlice = createSlice({
  name: "quizJob",
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<QuizJob>) => {
      const exists = state.find((j) => j.jobId === action.payload.jobId);
      if (!exists) {
        state.unshift(action.payload);
      }
    },
    updateJob: (
      state,
      action: PayloadAction<{ jobId: string; updates: Partial<QuizJob> }>
    ) => {
      const job = state.find((j) => j.jobId === action.payload.jobId);
      if (job) Object.assign(job, action.payload.updates);
    },
    markViewed: (state, action: PayloadAction<string>) => {
      const job = state.find((j) => j.jobId === action.payload);
      if (job) job.isViewed = true;
    },
    cleanupOldJobs: (state) => {
      const now = Date.now();
      const TEN_MINUTES = 10 * 60 * 1000;
      const THIRTY_MINUTES = 30 * 60 * 1000;
      const ONE_HOUR = 60 * 60 * 1000;
      const MAX_JOBS = 10;

      let filtered = state.filter((job) => {
        const age = now - job.createdAt;
        if (age > ONE_HOUR) return false;

        if (job.status === "processing") return true;

        if (job.status === "error") return age < THIRTY_MINUTES;

        return !job.isViewed || age < TEN_MINUTES;
      });

      if (filtered.length > MAX_JOBS) {
        filtered = filtered
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_JOBS);
      }

      return filtered;
    },
  },
});

export const { addJob, updateJob, markViewed, cleanupOldJobs } =
  quizJobSlice.actions;
export default quizJobSlice.reducer;
