import { useQuery } from "@tanstack/react-query";
import quizAttemptService from "@/services/quizAttemptService";
import type { selectQuizAttemptDTO } from "@/types/quizAttemptAnswer/selectQuizAttemptDTO";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import { PagedData } from "@/types/common/paged-data";
import type { AxiosError } from "axios";

interface UseGetAllQuizAttemptsOptions {
  quizId: string;
  enabled?: boolean;
  sortByNewest?: boolean;
  pageSize?: number;
  pageNumber?: number;
}

const useGetAllQuizAttempts = (options: UseGetAllQuizAttemptsOptions) => {
  const {
    quizId,
    enabled = true,
    sortByNewest = true,
    pageSize = 10,
    pageNumber = 0,
  } = options;

  return useQuery<PagedData<selectQuizAttemptDTO, string>, AxiosError>({
    queryKey: ["quizAttempts", quizId, { pageNumber, pageSize, sortByNewest }],
    enabled: enabled && !!quizId,
    queryFn: async () => {
      const payload: Page<string> = {
        size: pageSize,
        pageNumber: pageNumber,
        totalElements: 0,
        orders: [
          {
            sort: "dateModified",
            sortDir: sortByNewest ? SortOrderType.DESC : SortOrderType.ASC,
            dynamicProperty: "",
            delimiter: "",
            dataType: "",
          },
        ],
        filter: [],
        selected: [],
      };

      return await quizAttemptService.getAllQuizAttempts(payload, quizId);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export default useGetAllQuizAttempts;
