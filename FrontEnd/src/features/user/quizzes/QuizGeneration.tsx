import React, { useState, useRef, useEffect } from "react";
import { Steps, Card, Flex, Typography, Button, Form } from "antd";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  FileOutlined,
  SettingOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { SourcePanel } from "./QuizGenerationSteps/SourcePanel";
import { OptionsPanel } from "./QuizGenerationSteps/OptionsPanel";
import { ReviewPanel } from "./QuizGenerationSteps/ReviewPanel";

import type { CreateQuizDTO } from "@/types/quiz/createQuizDTO";
import useGenerateQuiz from "@/hooks/quizHook/useGenerateQuiz";
import useGetAllNote from "@/hooks/noteHook/useGetAllNote";

const { Title, Text } = Typography;

const QuizGeneration: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const { generateQuiz, isLoading } = useGenerateQuiz();
  // Quiz options state
  const [createQuiz, setCreateQuiz] = useState<CreateQuizDTO>({
    noteId: "",
    noteContent: "",
    count_Mcq: 3,
    count_Tf: 3,
    count_Msq: 4,
    language: "English",
    difficulty: "easy",
  });

  // Selection & search state
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [query, setQuery] = useState("");

  // Get notes data for selected note
  const { data: notesData } = useGetAllNote();

  const selectedNote = notesData?.data?.find(
    (note) => note.id === selectedNoteId
  );

  // Measure header height on mount and resize
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [current, isMobile]); // Re-measure when step changes or mobile view changes

  // Handle scroll to collapse/expand header
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

  // Navigation
  const next = async () => {
    if (current === 0) {
      // Ensure a note is selected
      await form.validateFields(); // validates hidden noteId

      // Persist selected note ID and content into createQuiz
      setCreateQuiz((prev) => ({
        ...prev,
        noteId: selectedNoteId || "",
        noteContent: selectedNote?.content ?? "",
      }));
    }
    setCurrent((c) => Math.min(c + 1, 2));
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleGenerateQuiz = () => {
    generateQuiz(createQuiz);
  };

  const steps = [
    {
      title: "Source",
      icon: <FileOutlined />,
      content: (
        <SourcePanel
          selectedNoteId={selectedNoteId}
          query={query}
          form={form}
          setQuery={setQuery}
          setSelectedNoteId={setSelectedNoteId}
        />
      ),
    },
    {
      title: "Options",
      icon: <SettingOutlined />,
      content: (
        <OptionsPanel initial={createQuiz} setCreateQuiz={setCreateQuiz} />
      ),
    },
    {
      title: "Review",
      icon: <EyeOutlined />,
      content: (
        <ReviewPanel selectedNote={selectedNote} quizOptions={createQuiz} />
      ),
    },
  ];

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
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quiz Generation
              </Title>
              <Text type="secondary">
                Create a customized quiz from your notes to test your knowledge
              </Text>
            </div>
            <Link to="/user/quiz">
              <Button icon={<ArrowLeftOutlined />} disabled={isLoading}>
                Back to Quizzes
              </Button>
            </Link>
          </div>

          <Steps
            current={current}
            responsive={false}
            size="small"
            type="navigation"
            className="custom-steps"
          >
            {steps.map((item, index) => (
              <Steps.Step
                key={item.title}
                title={item.title}
                icon={item.icon}
                status={
                  current === index
                    ? "process"
                    : current > index
                    ? "finish"
                    : "wait"
                }
                disabled={isLoading}
              />
            ))}
          </Steps>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <Card
          style={{
            width: "100%",
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            borderRadius: isMobile ? 12 : 16,
            background: "#ffffff",
          }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 200px)",
          }}
          className="quiz-generation-card"
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? 16 : 32,
              paddingBottom: 0,
            }}
            className="quiz-generation-content"
          >
            <div style={{ margin: "0 auto" }}>{steps[current].content}</div>
          </div>

          <Flex
            justify="flex-end"
            style={{
              borderTop: "1px solid #f0f0f0",
              padding: isMobile ? 16 : 24,
              position: "sticky",
              bottom: 0,
              backgroundColor: "#ffffff",
              zIndex: 9,
              boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div>
              {current > 0 && (
                <Button
                  style={{ marginRight: 12 }}
                  onClick={prev}
                  disabled={isLoading}
                  size="large"
                >
                  Previous
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={next}
                  disabled={isLoading}
                  size="large"
                  style={{ minWidth: 100 }}
                >
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleGenerateQuiz}
                  loading={isLoading}
                  icon={isLoading ? <LoadingOutlined /> : undefined}
                  size="large"
                  style={{ minWidth: 160 }}
                >
                  {isLoading ? "Generating Quiz..." : "Generate Quiz"}
                </Button>
              )}
            </div>
          </Flex>
        </Card>
      </div>
    </div>
  );
};

export default QuizGeneration;
