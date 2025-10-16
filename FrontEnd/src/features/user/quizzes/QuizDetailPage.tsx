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
  theme,
} from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { useUnsavedChanges } from "@/hooks/common/useUnsavedChanges";
import { formatDMY } from "@/utils/date";
import QuizHeader from "./components/QuizHeader";
import QuestionList from "./components/QuestionList";

const { Text } = Typography;
const { useToken } = theme;

const QuizDetailPage: React.FC = () => {
  const { token } = useToken();
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
          boxShadow: token.boxShadowSecondary,
          borderRadius: isMobile ? token.borderRadiusLG : token.borderRadiusLG,
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
          boxShadow: token.boxShadowSecondary,
          borderRadius: isMobile ? token.borderRadiusLG : token.borderRadiusLG,
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
                color: token.colorError,
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
          boxShadow: token.boxShadow,
          borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
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
              marginTop: isMobile ? token.marginSM : token.margin,
              borderRadius: token.borderRadius,
            }}
            bodyStyle={{
              padding: isMobile ? token.paddingSM : token.padding,
            }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
              <Space size="small">
                <Tag
                  color="blue"
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    padding: isMobile ? "4px 10px" : "5px 12px",
                    borderRadius: token.borderRadiusSM,
                    fontWeight: 500,
                  }}
                >
                  {(quiz?.questions ?? []).length} Question
                  {(quiz?.questions ?? []).length !== 1 ? "s" : ""}
                </Tag>
              </Space>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 12 : 14,
                }}
              >
                Created {quiz.dateCreated && formatDMY(quiz.dateCreated)}
              </Text>
            </Flex>
          </Card>
        </div>
      </div>

      {/* Main Content with Spacer */}
      <div>
        <Card
          style={{
            width: "100%",
            margin: "0 auto",
            boxShadow: token.boxShadowSecondary,
            borderRadius: 0,
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

      <Modal
        title={
          <Space>
            <WarningOutlined
              style={{ color: token.colorWarning, fontSize: 20 }}
            />
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
      >
        <div style={{ paddingTop: token.paddingSM }}>
          <p
            style={{
              fontSize: isMobile ? 14 : 15,
              marginBottom: token.marginSM,
            }}
          >
            You have unsaved changes that will be lost.
          </p>
          <Text type="secondary" style={{ fontSize: isMobile ? 14 : 15 }}>
            Do you want to discard your changes or continue editing?
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default QuizDetailPage;
