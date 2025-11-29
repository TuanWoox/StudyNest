import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { theme, Button, Space } from "antd";
import { ArrowLeftOutlined, BarChartOutlined, ReloadOutlined } from "@ant-design/icons";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import useGetAllQuizAttempts from "@/hooks/quizAttempt/useGetAllQuizAttempts";
import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import SpinnerFull from "@/components/SpinnerFull/SpinnerFull";
import {
  QuizHistoryHeader,
  QuizHistoryList,
  QuizHistoryPagination,
} from "./components";
import QuizStatistics, { QuizStatisticsRef } from "../QuizStatistics/QuizStatistics";

const { useToken } = theme;

const QuizHistory: React.FC = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useToken();

  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortByNewest, setSortByNewest] = useState(true);

  // Fetch quiz details
  const {
    data: quiz,
    isLoading: isLoadingQuiz,
    error: quizError,
  } = useGetQuizDetail(quizId || "");

  // Fetch quiz attempts
  const {
    data: attemptsData,
    isLoading: isLoadingAttempts,
    error: attemptsError,
    refetch,
  } = useGetAllQuizAttempts({
    quizId: quizId || "",
    enabled: !!quizId,
    sortByNewest,
    pageSize,
    pageNumber,
  });

  const quizStatsRef = useRef<QuizStatisticsRef>(null);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setPageNumber(page - 1);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const handleSortChange = (newest: boolean) => {
    setSortByNewest(newest);
    setPageNumber(0);
  };

  const handleBack = () => {
    navigate("/user/quiz");
  };

  if (isLoadingQuiz || isLoadingAttempts) {
    return <SpinnerFull />;
  }

  if (quizError || attemptsError || !quiz) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          padding: "20px",
        }}
      >
        <EmptyState
          type="error"
          title="Failed to Load Quiz"
          description={quizError?.message || attemptsError?.message || "Quiz not found. Please try again."}
          actionLabel="Back to Quizzes"
          actionIcon={<ArrowLeftOutlined />}
          onAction={handleBack}
        />
      </div>
    );
  }

  const attempts = attemptsData?.data || [];
  const totalAttempts = attemptsData?.page?.totalElements || 0;

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
        {/* Header */}
        <QuizHistoryHeader
          quizTitle={quiz.title}
          onBack={handleBack}
        />


        {/* Sort and Refresh Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Space>
            <Button
              type={sortByNewest ? "primary" : "default"}
              onClick={() => handleSortChange(true)}
              style={{
                fontFamily: "monospace",
                borderRadius: 0,
                fontWeight: 600,
              }}
            >
              Newest
            </Button>
            <Button
              type={!sortByNewest ? "primary" : "default"}
              onClick={() => handleSortChange(false)}
              style={{
                fontFamily: "monospace",
                borderRadius: 0,
                fontWeight: 600,
              }}
            >
              Oldest
            </Button>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => quizStatsRef.current?.handleOpenStats()}
              style={{
                fontFamily: "monospace",
                borderRadius: 0,
                fontWeight: 600,
              }}
            >
              Quiz Stats
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              style={{
                fontFamily: "monospace",
                borderRadius: 0,
                fontWeight: 600,
              }}
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              borderRadius: 0,
              backgroundColor: token.colorBgContainer,
            }}
          >
            <EmptyState
              type="info"
              title="No Attempts Yet"
              description="You haven't taken this quiz yet. Take it now to see your progress and results!"
              actionLabel="Take Quiz Now"
              onAction={() => navigate(`/user/quiz/quizAttempt/${quizId}`)}
            />
          </div>
        ) : (
          <>

            {quizId ? <QuizStatistics ref={quizStatsRef} quizId={quizId} /> : null}

            <QuizHistoryList
              attempts={attempts}
              quizId={quizId || ""}
            />

            {/* Pagination */}
            <QuizHistoryPagination
              current={pageNumber + 1}
              pageSize={pageSize}
              total={totalAttempts}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
