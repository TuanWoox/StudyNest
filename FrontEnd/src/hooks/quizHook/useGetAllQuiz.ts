// hooks/useGetAllQuiz.ts
import { useQuery } from "@tanstack/react-query";
import quizService from "@/services/quizService";
import type { QuizList } from "@/types/quiz/quiz";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import { PagedData } from "@/types/common/paged-data";
import type { AxiosError } from "axios";
import { StudyNestFilterType } from "@/constants/filterType";

interface UseGetAllQuizOptions {
  enabled?: boolean;
  sortByNewest?: boolean;
  pageSize?: number;
  pageNumber?: number;
  searchTerm?: string;
}

/**
 * Hook to fetch paginated quiz list
 */
const useGetAllQuiz = (options?: UseGetAllQuizOptions) => {
  const enabled = options?.enabled ?? true;
  const sortByNewest = options?.sortByNewest ?? true;
  const pageSize = options?.pageSize ?? 8;
  const pageNumber = options?.pageNumber ?? 0;
  const searchTerm = options?.searchTerm ?? "";

  return useQuery<PagedData<QuizList, string>, AxiosError>({
    queryKey: ["quizzes", { pageNumber, pageSize, sortByNewest, searchTerm }],
    enabled,
    queryFn: async () => {
      // Create the payload based on options
      const payload: Page<string> = {
        size: pageSize,
        pageNumber: pageNumber,
        totalElements: 0, // Server will set the actual value
        orders: sortByNewest
          ? [
              {
                sort: "dateModified",
                sortDir: SortOrderType.DESC,
                dynamicProperty: "",
                delimiter: "",
                dataType: "",
              },
            ]
          : [],
        filter: searchTerm
          ? [
              {
                prop: "title",
                value: searchTerm,
                filterOperator: "Contains",
                filterType: StudyNestFilterType.Text,
                dynamicProperty: "",
                delimiter: "",
              },
            ]
          : [],
        selected: [],
      };

      return await quizService.getAllQuiz(payload);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export default useGetAllQuiz;
