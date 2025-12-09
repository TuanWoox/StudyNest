import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Skeleton,
  theme,
} from "antd";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { useQueryClient } from "@tanstack/react-query";
import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { useUnsavedChanges } from "@/hooks/common/useUnsavedChanges";
import { useCollapsibleHeader } from "@/hooks/common/useCollapsibleHeader";
import QuizHeader from "./components/QuizHeader";
import QuestionList from "./components/QuestionList";
import { QuizMetadataCard, QuizPublishSettings, UnsavedChangesModal } from "./components";
import { useQuizTimeLimit } from "@/hooks/quizAttempt/useQuizTimeLimit";
import { useGetActiveQuizSession } from "@/hooks/quizSessionHook/useGetActiveQuizSession";
const { useToken } = theme;

const QuizDetailPage: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;

  const [isDirty, setIsDirty] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const {
    data: quiz,
    isPending,
    isError,
    error,
  } = useGetQuizDetail(id, { enabled: !!id });

  // Collapsible header hook
  const { isHeaderCollapsed, scrollContainerRef, headerRef } =
    useCollapsibleHeader({
      dependencies: [quiz, isMobile],
      scrollThreshold: 10,
    });

  const {
    showConfirmDiscard,
    isUnsavedModalOpen,
    handleDiscardChanges,
    handleContinueEditing,
  } = useUnsavedChanges({ isDirty });

  const { openTimeLimitModal, TimeLimitModal } = useQuizTimeLimit({ quizId: id });

  const { activeSession, isLoading: isLoadingActiveSession } = useGetActiveQuizSession(id || "", !!id);

  const handleReturnQuiz = () => {
    showConfirmDiscard(() => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      navigate(`/user/quiz`);
    });
  };

  if (isPending) {
    return (
      <Card
        style={{
          width: "100%",
          overflow: "auto",
          margin: "0 auto",
          border: borderColor,
          borderRadius: 0,
        }}
        bodyStyle={{
          padding: isMobile ? 16 : 32,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (isError || !quiz) {
    return (
      <Card
        style={{
          width: "100%",
          overflow: "auto",
          margin: "0 auto",
          borderRadius: 0,
        }}
        bodyStyle={{
          padding: isMobile ? 16 : 32,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EmptyState
          type="error"
          title="Failed to Load Quiz"
          description={error?.message || "Failed to load quiz details. Please try again."}
          actionLabel="Back to Quizzes"
          onAction={handleReturnQuiz}
        />
      </Card>
    );
  }

  const onTakeQuiz = () => {
    openTimeLimitModal(() => {
      navigate(`/user/quiz/quizAttempt/${id}`);
    });
  };

  // Quiz data successfully loaded
  return (
    <div
      ref={scrollContainerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        position: "relative",
        backgroundColor: token.colorBgLayout,
      }}
    >
      {/* Sticky Header Overlay */}
      <div
        ref={headerRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          transform: isHeaderCollapsed ? `translateY(-100%)` : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: token.colorBgContainer,
          willChange: "transform",
        }}
      >
        <div
          style={{
            padding: isMobile ? 16 : 32,
            paddingBottom: isMobile ? 16 : 32,
          }}
        >
          <QuizHeader
            quiz={quiz}
            onDirtyChange={setIsDirty}
            showConfirmDiscard={showConfirmDiscard}
            onTakeQuiz={onTakeQuiz}
            activeSession={activeSession}
            isLoadingActiveSession={isLoadingActiveSession}
          />
          <QuizMetadataCard
            questionCount={quiz?.questions?.length ?? 0}
            dateCreated={quiz.dateCreated}
            difficulty={quiz.difficulty}
            starCount={quiz?.quizStars?.length ?? 0}
          />
          <QuizPublishSettings
            quiz={quiz}
            onDirtyChange={setIsDirty}
            showConfirmDiscard={showConfirmDiscard}
          />
        </div>
      </div>

      {/* Main Content with Spacer */}
      <div>
        <Card
          style={{
            width: "100%",
            margin: "0 auto",
            borderRadius: 0,
            backgroundColor: token.colorBgContainer,
          }}
          bodyStyle={{
            padding: isMobile ? token.paddingSM : token.paddingLG,
            minHeight: "100vh",
          }}
        >
          <QuestionList
            quizId={id!}
            questions={quiz.questions ?? []}
            onDirtyChange={setIsDirty}
            showConfirmDiscard={showConfirmDiscard}
          />
        </Card>
      </div>

      <UnsavedChangesModal
        open={isUnsavedModalOpen}
        onDiscard={handleDiscardChanges}
        onContinue={handleContinueEditing}
      />

      {/* Used To Ask User To Choose Time To Do The Quiz */}
      {TimeLimitModal}
    </div>
  );
};

export default QuizDetailPage;
