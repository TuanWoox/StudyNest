import React, { useState } from "react";
import { theme } from "antd";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import useGetAllQuiz from "@/hooks/quizHook/useGetAllQuiz";
import useDeleteQuiz from "@/hooks/quizHook/useDeleteQuiz";
import useCreateManualQuiz from "@/hooks/quizHook/useCreateManualQuiz";
import useDebounce from "@/hooks/common/useDebounce";
import { SortOrderType } from "@/constants/sortOrderType";
import { Dayjs } from "dayjs";
import QuizHeader from "./components/QuizHeader";
import QuizSearchControls from "./components/QuizSearchControls";
import QuizGrid from "./components/QuizGrid";
import QuizDeleteModal from "./components/QuizDeleteModal";
import QuizPagination from "./components/QuizPagination";
import QuizFilterModal from "./components/QuizFilterModal";
import QuizCreateModal from "./components/QuizCreateModal";

const { useToken } = theme;

const Quizzes: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Filter & Sort states
  const [createdFilterRange, setCreatedFilterRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [sortField, setSortField] = useState<"dateCreated" | "title">("dateCreated");
  const [sortOrder, setSortOrder] = useState<SortOrderType>(SortOrderType.DESC);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: quizData,
    isPending,
    isError,
    error,
    refetch,
  } = useGetAllQuiz({
    pageNumber: page - 1,
    pageSize,
    searchTerm: debouncedSearchTerm,
    sortField,
    sortOrder,
    createdRange: createdFilterRange,
    difficulty,
  });

  const { deleteQuizAsync, isLoading: isDeleting } = useDeleteQuiz();
  const { createManualQuizAsync } = useCreateManualQuiz();

  const quizzes = quizData?.data || [];
  const totalElements = quizData?.page.totalElements || 0;

  const handleTableChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleDelete = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      setDeletingQuizId(quizToDelete.id);
      setShowDeleteModal(false);
      await deleteQuizAsync(quizToDelete.id);

      const currentPageItemCount = quizzes.length;
      const isLastItemOnPage = currentPageItemCount === 1;
      const isNotFirstPage = page > 1;

      if (isLastItemOnPage && isNotFirstPage) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error("Failed to delete quiz:", err);
    } finally {
      setDeletingQuizId(null);
      setQuizToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const handleGenerateFromNote = () => {
    setIsCreateModalOpen(false);
    navigate("/user/quiz/generate");
  };

  const handleCreateFromScratch = async () => {
    setIsCreateModalOpen(false);
    try {
      await createManualQuizAsync({
        title: "Untitled Quiz",
        difficulty: "medium",
        questions: [
          {
            name: "Question 1",
            type: "MCQ",
            explanation: "",
            choices: [
              { text: "Option A", isCorrect: true },
              { text: "Option B", isCorrect: false },
              { text: "Option C", isCorrect: false },
              { text: "Option D", isCorrect: false },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  if (isError || (!isPending && !quizData)) {
    return (
      <div style={{ padding: "24px", width: "100%" }}>
        <EmptyState
          type="error"
          title="Failed to Load Quizzes"
          description={error?.message || "Unable to load quiz list. Please try again."}
          actionLabel="Try Again"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px 24px",
        paddingBottom: "80px",
        width: "100%",
        minHeight: "100vh",
        overflow: "auto",
        backgroundColor: token.colorBgLayout,
        scrollbarWidth: "none",
      }}
    >
      <div style={{ width: "100%" }}>
        <QuizHeader />
        
        <QuizSearchControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenFilter={() => setIsFilterModalOpen(true)}
          onCreateQuiz={() => setIsCreateModalOpen(true)}
        />

        <QuizGrid
          quizzes={quizzes}
          isPending={isPending}
          pageSize={pageSize}
          page={page}
          onDelete={handleDelete}
          deletingId={deletingQuizId}
          isDeleting={isDeleting}
        />

        {totalElements > 0 && (
          <QuizPagination
            current={page}
            pageSize={pageSize}
            total={totalElements}
            onChange={handleTableChange}
          />
        )}
      </div>

      <QuizFilterModal
        open={isFilterModalOpen}
        defaultSortBy={sortField}
        defaultSortOrder={sortOrder}
        defaultCreatedRange={createdFilterRange}
        defaultDifficulty={difficulty || "all"}
        onCancel={() => setIsFilterModalOpen(false)}
        onApply={({ sortBy, sortOrder: order, createdRange, difficulty: diff }) => {
          setSortField((sortBy as "dateCreated" | "title") ?? "dateCreated");
          setSortOrder((order as SortOrderType) ?? SortOrderType.DESC);
          setCreatedFilterRange(createdRange ?? [null, null]);
          setDifficulty(diff);
          setPage(1);
          setIsFilterModalOpen(false);
        }}
      />

      <QuizDeleteModal
        visible={showDeleteModal}
        quizTitle={quizToDelete?.title}
        loading={deletingQuizId === quizToDelete?.id && isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <QuizCreateModal
        visible={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onGenerateFromNote={handleGenerateFromNote}
        onCreateFromScratch={handleCreateFromScratch}
      />
    </div>
  );
};

export default Quizzes;

