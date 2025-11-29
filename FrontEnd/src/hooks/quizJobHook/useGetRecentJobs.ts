import { useQuery } from "@tanstack/react-query";
import quizJobService from "@/services/quizJobService";
import { QuizJob } from "@/store/quizJobSlice";
import type { AxiosError } from "axios";

interface UseGetRecentJobsOptions {
  enabled?: boolean;
  sinceEpochMs?: number;
}

const useGetRecentJobs = (options?: UseGetRecentJobsOptions) => {
  const enabled = options?.enabled ?? false;
  const sinceEpochMs = options?.sinceEpochMs ?? Date.now();

  return useQuery<QuizJob[], AxiosError>({
    queryKey: ["quiz-jobs", "recent", sinceEpochMs],
    enabled,
    queryFn: async () => {
      return await quizJobService.getRecentJobs(sinceEpochMs);
    },
    staleTime: 0,
    gcTime: 1 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export default useGetRecentJobs;
