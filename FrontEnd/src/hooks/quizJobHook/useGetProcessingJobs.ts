import { useQuery } from "@tanstack/react-query";
import quizJobService from "@/services/quizJobService";
import { QuizJob } from "@/store/quizJobSlice";
import type { AxiosError } from "axios";

interface UseGetProcessingJobsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}
const useGetProcessingJobs = (options?: UseGetProcessingJobsOptions) => {
  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? false;

  return useQuery<QuizJob[], AxiosError>({
    queryKey: ["quiz-jobs", "processing"],
    enabled,
    queryFn: async () => {
      return await quizJobService.getProcessingJobs();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchInterval,
    refetchOnWindowFocus: true,
  });
};

export default useGetProcessingJobs;
