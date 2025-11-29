import { useQuery } from "@tanstack/react-query";
import quizService from "@/services/quizService";
import type { QuizList } from "@/types/quiz/quiz";
import { Page } from "@/types/common/page";
import { SortOrderType } from "@/constants/sortOrderType";
import { PagedData } from "@/types/common/paged-data";
import type { AxiosError } from "axios";
import { StudyNestFilterType } from "@/constants/filterType";
import { Dayjs } from "dayjs";

interface UseGetAllQuizOptions {
  enabled?: boolean;
  pageSize?: number;
  pageNumber?: number;
  searchTerm?: string;
    sortField?: "dateCreated" | "title";
  sortOrder?: SortOrderType;
  createdRange?: [Dayjs | null, Dayjs | null];
  difficulty?: string;
}

/**
 * Hook to fetch paginated quiz list
 */
const useGetAllQuiz = (options?: UseGetAllQuizOptions) => {
  const enabled = options?.enabled ?? true;
  const pageSize = options?.pageSize ?? 8;
  const pageNumber = options?.pageNumber ?? 0;
  const searchTerm = options?.searchTerm ?? "";
  const sortField = options?.sortField ?? "dateCreated";
  const sortOrder = options?.sortOrder ?? SortOrderType.DESC;
  const createdRange = options?.createdRange ?? [null, null];
  const difficulty = options?.difficulty;

  return useQuery<PagedData<QuizList, string>, AxiosError>({
    queryKey: ["quizzes", { pageNumber, pageSize, searchTerm, sortField, sortOrder, createdRange, difficulty }],
    enabled,
    queryFn: async () => {
      const filters: any[] = [];

      // Search filter
      if (searchTerm) {
        filters.push({
          prop: "title",
          value: searchTerm,
          filterOperator: "Contains",
          filterType: StudyNestFilterType.Text,
          dynamicProperty: "",
          delimiter: "",
        });
      }

      // Difficulty filter
      if (difficulty) {
        filters.push({
          prop: "difficulty",
          value: difficulty,
          filterOperator: "IsEqualTo",
          filterType: StudyNestFilterType.Text,
          dynamicProperty: "",
          delimiter: "",
        });
      }

      // Date range filter - split into two separate filters like Note
      if (createdRange[0]) {
        filters.push({
          prop: "dateCreated",
          value: createdRange[0].startOf("day").toISOString(),
          filterOperator: "IsAfterOrEqual",
          filterType: StudyNestFilterType.DateTime,
          dynamicProperty: "",
          delimiter: "",
        });
      }
      if (createdRange[1]) {
        filters.push({
          prop: "dateCreated",
          value: createdRange[1].endOf("day").toISOString(),
          filterOperator: "IsBeforeOrEqual",
          filterType: StudyNestFilterType.DateTime,
          dynamicProperty: "",
          delimiter: "",
        });
      }

      const payload: Page<string> = {
        size: pageSize,
        pageNumber: pageNumber,
        totalElements: 0,
        orders: [
          {
            sort: sortField,
            sortDir: sortOrder,
            dynamicProperty: "",
            delimiter: "",
            dataType: "",
          },
        ],
        filter: filters,
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
