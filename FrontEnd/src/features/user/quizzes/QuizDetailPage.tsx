import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Flex,
  Button,
  Space,
  Tag,
  Skeleton,
  Empty,
  Modal,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { useUnsavedChanges } from "@/hooks/common/useUnsavedChanges";
import { formatDMY } from "@/utils/date";
import QuizHeader from "./components/QuizHeader";
import QuestionList from "./components/QuestionList";

const { Text } = Typography;

const QuizDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isDirty, setIsDirty] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const {
    data: quiz,
    isPending,
    isError,
    error,
  } = useGetQuizDetail(id, { enabled: !!id });

  // Measure header height on mount and resize
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [quiz, isMobile]); // Re-measure if quiz data or mobile view changes

  // Handle scroll to collapse/expand header with improved stability
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const lastScrollTop = lastScrollTopRef.current;
      const delta = scrollTop - lastScrollTop;

      // Hysteresis: only change state when scrolling past a certain delta
      if (Math.abs(delta) < 10) return;

      const isScrollingDown = delta > 0;

      if (isScrollingDown && scrollTop > headerHeight && !isHeaderCollapsed) {
        setIsHeaderCollapsed(true);
      } else if (!isScrollingDown && isHeaderCollapsed) {
        setIsHeaderCollapsed(false);
      }

      lastScrollTopRef.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [isHeaderCollapsed, headerHeight]);

  const {
    showConfirmDiscard,
    isUnsavedModalOpen,
    handleDiscardChanges,
    handleContinueEditing,
  } = useUnsavedChanges({ isDirty });

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
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          borderRadius: isMobile ? 12 : 16,
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
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          borderRadius: isMobile ? 12 : 16,
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
        <Empty
          image={
            <WarningOutlined
              style={{
                fontSize: isMobile ? 40 : 48,
                color: "#ff4d4f",
              }}
            />
          }
          description={
            <Text type="danger" style={{ fontSize: isMobile ? 13 : 14 }}>
              {error?.message || "Failed to load quiz details"}
            </Text>
          }
        >
          <Button
            onClick={handleReturnQuiz}
            type="primary"
            size={isMobile ? "middle" : "large"}
          >
            Back to Quizzes
          </Button>
        </Empty>
      </Card>
    );
  }

  const onTakeQuiz = () => {
    navigate(`/user/quizAttempt/${id}`);
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
        backgroundColor: "#fafafa",
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
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderRadius: isMobile ? "0 0 12px 12px" : "0 0 16px 16px",
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
          />
          <Card
            style={{
              marginTop: isMobile ? 12 : 16,
              borderRadius: isMobile ? 10 : 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            bodyStyle={{
              padding: isMobile ? 12 : 16,
            }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
              <Space>
                <Tag
                  color="cyan"
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    padding: isMobile ? "4px 8px" : "5px 10px",
                    borderRadius: 8,
                    fontWeight: 500,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(19, 194, 194, 0.2)",
                  }}
                >
                  📋 {(quiz?.questions ?? []).length} Question
                  {(quiz?.questions ?? []).length !== 1 ? "s" : ""}
                </Tag>
              </Space>
              <Space>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  🗓️ Created on{" "}
                  {quiz.dateCreated && formatDMY(quiz.dateCreated)}
                </Text>
              </Space>
            </Flex>
          </Card>
        </div>
      </div>

      {/* Main Content with Spacer */}
      <div style={{ padding: isMobile ? 16 : 0, paddingTop: 0 }}>
        <Card
          style={{
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            borderRadius: isMobile ? 12 : 16,
            background: "#ffffff",
          }}
          bodyStyle={{
            padding: isMobile ? 16 : 32,
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

      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#faad14", fontSize: 20 }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              Unsaved Changes
            </span>
          </Space>
        }
        open={isUnsavedModalOpen}
        onOk={handleDiscardChanges}
        onCancel={handleContinueEditing}
        okText="Discard Changes"
        cancelText="Continue Editing"
        okButtonProps={{
          danger: true,
          size: "large",
          style: { fontWeight: 500 },
        }}
        cancelButtonProps={{
          size: "large",
        }}
        centered
        width={isMobile ? 340 : 450}
        styles={{
          body: {
            padding: isMobile ? "20px 16px" : "24px",
          },
        }}
      >
        <div style={{ paddingTop: 12 }}>
          <p style={{ fontSize: isMobile ? 14 : 15, marginBottom: 12 }}>
            You have unsaved changes that will be lost.
          </p>
          <p
            style={{
              fontSize: isMobile ? 14 : 15,
              marginBottom: 0,
              color: "#595959",
            }}
          >
            Do you want to discard your changes or continue editing?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetailPage;
