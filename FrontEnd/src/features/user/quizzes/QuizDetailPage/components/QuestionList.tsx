import React, { useState, useEffect } from "react";
import { Collapse, theme } from "antd";

const { useToken } = theme;
import { QuestionForm } from "./QuestionForm";
import { QuestionItem } from "./QuestionItem";
import { QuestionListHeader } from "./QuestionListHeader";
import { QuestionListEmpty } from "./QuestionListEmpty";
import useUpdateQuestion from "@/hooks/questionHook/useUpdateQuestion";
import useCreateQuestion from "@/hooks/questionHook/useCreateQuestion";
import useDeleteQuestion from "@/hooks/questionHook/useDeleteQuestion";
import type { Question } from "@/types/quiz/quiz";
import type { CreateQuestionDTO } from "@/types/question/createQuestionDTO";
import type { UpdateQuestionDTO } from "@/types/question/updateQuestionDTO";

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

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

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

  return (
    <>
      {/* Header Section */}
      <QuestionListHeader
        questionCount={questions.length}
        isAllExpanded={isAllExpanded}
        onToggleAll={handleToggleAllQuestions}
        onAddQuestion={handleStartAddQuestion}
      />

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
          <div style={{ paddingRight: 4 }}>
            <div
              style={{
                marginBottom: token.margin,
                backgroundColor: token.colorBgContainer,
                borderRadius: 0,
                border: borderColor,
                boxShadow: shadowColor,
                overflow: "hidden",
              }}
            >
              <QuestionForm
                quizId={quizId}
                onSave={handleCreateQuestion}
                onCancel={handleCancelAddQuestion}
                isLoading={isCreatingQuestion}
                onDirtyChange={onDirtyChange}
              />
            </div>
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
              paddingRight: "4px",
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
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    Question {index + 1}: {question.name}
                  </div>
                ),
                children: isEditing ? (
                  <div>
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
                  borderRadius: 0,
                  border: borderColor,
                  boxShadow: shadowColor,
                  overflow: "hidden",
                },
              };
            })}
          />
        ) : (
          !isAddingQuestion && (
            <QuestionListEmpty onAddQuestion={handleStartAddQuestion} />
          )
        )}
      </div>
    </>
  );
};

export default QuestionList;
