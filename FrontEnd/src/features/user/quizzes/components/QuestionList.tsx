import React, { useState, useEffect } from "react";
import { Flex, Button, Typography, Empty, Space, Collapse, theme } from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { useToken } = theme;
import { QuestionForm } from "./QuestionForm";
import { QuestionItem } from "./QuestionItem";
import useUpdateQuestion from "@/hooks/questionHook/useUpdateQuestion";
import useCreateQuestion from "@/hooks/questionHook/useCreateQuestion";
import useDeleteQuestion from "@/hooks/questionHook/useDeleteQuestion";
import type { Question } from "@/types/quiz/quiz";
import type { CreateQuestionDTO } from "@/types/question/createQuestionDTO";
import type { UpdateQuestionDTO } from "@/types/question/updateQuestionDTO";

const { Title, Text } = Typography;

interface QuestionListProps {
  quizId: string;
  questions: Question[];
  onDirtyChange: (isDirty: boolean) => void;
  showConfirmDiscard: (action: () => void) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  quizId,
  questions,
  onDirtyChange,
  showConfirmDiscard,
}) => {
  const { token } = useToken();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const { updateQuestionAsync, isLoading: isUpdatingQuestion } =
    useUpdateQuestion();
  const { createQuestionAsync, isLoading: isCreatingQuestion } =
    useCreateQuestion();
  const { deleteQuestionAsync, isLoading: isDeletingQuestion } =
    useDeleteQuestion({ quizId });

  const handleUpdateQuestion = async (questionData: Partial<Question>) => {
    if (!questionData.id) return;

    const payload: UpdateQuestionDTO = {
      id: questionData.id,
      quizId,
      name: questionData.name!,
      type: questionData.type!,
      explanation: questionData.explanation || "",
      choices: questionData.choices!,
    };

    await updateQuestionAsync(payload);
    setEditingQuestionId(null);
    onDirtyChange(false);
  };

  const handleCreateQuestion = async (questionData: Partial<Question>) => {
    const payload: CreateQuestionDTO = {
      quizId,
      name: questionData.name!,
      type: questionData.type!,
      explanation: questionData.explanation || "",
      choices: questionData.choices!.map((c) => ({
        text: c.text,
        isCorrect: c.isCorrect,
      })),
    };

    await createQuestionAsync(payload);
    setIsAddingQuestion(false);
    onDirtyChange(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestionAsync(questionId);
  };

  const handleStartAddQuestion = () => {
    setIsAddingQuestion(true);
    onDirtyChange(true);
  };

  const handleCancelAddQuestion = () => {
    showConfirmDiscard(() => {
      setIsAddingQuestion(false);
      onDirtyChange(false);
    });
  };

  const handleStartEditQuestion = (questionId: string) => {
    setEditingQuestionId(questionId);
    onDirtyChange(true);
  };

  const handleCancelEditQuestion = () => {
    showConfirmDiscard(() => {
      setEditingQuestionId(null);
      onDirtyChange(false);
    });
  };

  // Handle Expand/Collapse All
  const handleToggleAllQuestions = () => {
    if (isAllExpanded) {
      setExpandedKeys([]);
      setIsAllExpanded(false);
    } else {
      setExpandedKeys(questions.map((q) => q.id));
      setIsAllExpanded(true);
    }
  };

  const handleCollapseChange = (keys: string | string[]) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    setExpandedKeys(keysArray);
    setIsAllExpanded(keysArray.length === questions.length);
  };

  // Add custom styles for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .question-item-card {
        animation: slideIn 0.3s ease-out;
      }
      
      .question-item-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
        transform: translateY(-2px);
      }
      
      .question-action-btn:hover {
        background-color: rgba(24, 144, 255, 0.08) !important;
      }
      
      .add-question-btn {
        transition: all 0.3s ease;
      }
      
      .add-question-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Header Section */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          marginBottom: token.marginLG,
        }}
        wrap="wrap"
        gap={token.margin}
      >
        <Space direction="vertical" size={token.marginXXS}>
          <Title level={4} style={{ margin: 0 }}>
            Questions
          </Title>
          <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
            {questions.length === 0
              ? "No questions yet"
              : `${questions.length} question${
                  questions.length > 1 ? "s" : ""
                }`}
          </Text>
        </Space>
        <Space wrap>
          {questions.length > 0 && (
            <Button
              icon={isAllExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={handleToggleAllQuestions}
              style={{
                borderRadius: token.borderRadiusSM,
                fontWeight: 500,
              }}
              size={isMobile ? "middle" : "large"}
            >
              {isAllExpanded ? "Collapse All" : "Expand All"}
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleStartAddQuestion}
            size={isMobile ? "middle" : "large"}
            style={{
              borderRadius: token.borderRadiusSM,
              height: isMobile ? 36 : 44,
              paddingLeft: isMobile ? token.padding : token.paddingLG,
              paddingRight: isMobile ? token.padding : token.paddingLG,
              fontWeight: 500,
            }}
            className="add-question-btn"
          >
            {isMobile ? "Add" : "Add Question"}
          </Button>
        </Space>
      </Flex>

      {/* Content Section */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: token.margin,
        }}
      >
        {/* Add Question Form */}
        {isAddingQuestion && (
          <div style={{ marginBottom: token.marginLG }}>
            <QuestionForm
              quizId={quizId}
              onSave={handleCreateQuestion}
              onCancel={handleCancelAddQuestion}
              isLoading={isCreatingQuestion}
              onDirtyChange={onDirtyChange}
            />
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 ? (
          <Collapse
            activeKey={expandedKeys}
            onChange={handleCollapseChange}
            accordion={false}
            style={{
              backgroundColor: "transparent",
              border: "none",
              alignItems: "center",
            }}
            expandIconPosition="end"
            items={questions.map((question, index) => {
              const isEditing = editingQuestionId === question.id;

              return {
                key: question.id,
                label: (
                  <div
                    style={{
                      padding: isMobile
                        ? `${token.marginXXS}px 0`
                        : `${token.marginXS}px 0`,
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 500,
                    }}
                  >
                    Question {index + 1}: {question.name}
                  </div>
                ),
                children: isEditing ? (
                  <div
                    style={{
                      padding: isMobile
                        ? `${token.marginSM}px 0`
                        : `${token.margin}px 0`,
                    }}
                  >
                    <QuestionForm
                      question={question}
                      quizId={quizId}
                      onSave={handleUpdateQuestion}
                      onCancel={handleCancelEditQuestion}
                      isLoading={isUpdatingQuestion}
                      onDirtyChange={onDirtyChange}
                    />
                  </div>
                ) : (
                  <div>
                    <QuestionItem
                      question={question}
                      index={index}
                      onEdit={handleStartEditQuestion}
                      onDelete={handleDeleteQuestion}
                      isDeleting={isDeletingQuestion}
                    />
                  </div>
                ),
                style: {
                  marginBottom: token.margin,
                  backgroundColor: token.colorBgContainer,
                  borderRadius: token.borderRadiusLG,
                  border: `1px solid ${token.colorBorder}`,
                  overflow: "hidden",
                },
              };
            })}
          />
        ) : (
          !isAddingQuestion && (
            <Empty
              image={
                <InboxOutlined
                  style={{ fontSize: 64, color: token.colorTextDisabled }}
                />
              }
              description={
                <Space direction="vertical" size={token.marginXS}>
                  <Text strong style={{ fontSize: 16, color: token.colorText }}>
                    No Questions Yet
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Click "Add Question" to create your first question
                  </Text>
                </Space>
              }
              style={{
                padding: "60px 20px",
                backgroundColor: token.colorBgLayout,
                borderRadius: token.borderRadiusLG,
                border: `2px dashed ${token.colorBorder}`,
              }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleStartAddQuestion}
                size="large"
                style={{
                  borderRadius: token.borderRadiusSM,
                  height: 44,
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                Add Your First Question
              </Button>
            </Empty>
          )
        )}
      </div>
    </>
  );
};

export default QuestionList;
