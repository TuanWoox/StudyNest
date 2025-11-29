import { createContext, useContext } from "react";
import type { QuizJob } from "@/store/quizJobSlice";

export interface QuizJobContextValue {
  jobs: QuizJob[];
  unreadCount: number;
  markViewed: (jobId: string) => void;
  connectionStatus:
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting";
  isLoading?: boolean;
}

export const QuizJobContext = createContext<QuizJobContextValue>({
  jobs: [],
  unreadCount: 0,
  markViewed: () => {},
  connectionStatus: "disconnected",
  isLoading: false,
});

export const useQuizJobContext = () => useContext(QuizJobContext);
