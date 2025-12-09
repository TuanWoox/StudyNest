import React, { useState, useEffect, useRef } from "react";
import { Flex, Space, message, Alert, Button } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useUpdateQuiz from "@/hooks/quizHook/useUpdateQuiz";
import { validateQuizTitle } from "@/utils/validation";
import { QuizTitleEditor, QuizTitleDisplay, QuizActions } from "./";
import CreateQuizSessionModal, { CreateQuizSessionModalRef } from "./CreateQuizSessionModal";
import { QuizSessionDTO } from "@/types/quizSession/quizSession";

interface QuizHeaderProps {
  quiz: any;
  onDirtyChange: (isDirty: boolean) => void;
  showConfirmDiscard: (action: () => void) => void;
  onTakeQuiz: () => void;
  activeSession?: QuizSessionDTO;
  isLoadingActiveSession?: boolean;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  quiz,
  onDirtyChange,
  showConfirmDiscard,
  onTakeQuiz,
  activeSession,
  isLoadingActiveSession,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(quiz.title);
  const createSessionModalRef = useRef<CreateQuizSessionModalRef>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const { updateQuizAsync, isLoading: isUpdatingQuiz } = useUpdateQuiz();

  useEffect(() => {
    setEditedTitle(quiz.title);
  }, [quiz.title]);

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    onDirtyChange(true);
  };

  const handleSaveTitle = async () => {
    const error = validateQuizTitle(editedTitle);
    if (error) {
      message.error(error);
      return;
    }

    try {
      await updateQuizAsync({
        id: quiz.id,
        title: editedTitle,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          name: q.name,
          type: q.type,
          explanation: q.explanation || "",
          choices: q.choices,
        })),
      });
      message.success("Title updated successfully");
      setIsEditingTitle(false);
      onDirtyChange(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      message.error("Failed to update title");
    }
  };

  const handleCancelTitleEdit = () => {
    showConfirmDiscard(() => {
      setEditedTitle(quiz.title);
      setIsEditingTitle(false);
      onDirtyChange(false);
    });
  };

  const handleReturnQuiz = () => {
    showConfirmDiscard(() => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      navigate(`/user/quiz`);
    });
  };

  const handleCreateSession = async () => {
    createSessionModalRef.current?.open(quiz.id);
  };

  const handleJoinActiveSession = () => {
    if (activeSession?.id) {
      navigate(`/user/quizSession/play/${activeSession.id}`);
    }
  };

  return (
    <Flex
      vertical
      gap={16}
      style={{
        marginBottom: 0,
      }}
    >
      {!isLoadingActiveSession && activeSession && (
        <Alert
          message="Active Quiz Session"
          description={
            <Flex vertical gap={8}>
              <span>There is an ongoing quiz session. Join now to participate!</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>PIN: {activeSession.gamePin}</span>
            </Flex>
          }
          type="info"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={handleJoinActiveSession}
              style={{
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              Join Session
            </Button>
          }
          style={{
            borderRadius: 0,
            border: "2px solid",
          }}
        />
      )}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Space size={isMobile ? 8 : 16} style={{ flex: 1, minWidth: 0 }}>
          {isEditingTitle ? (
            <QuizTitleEditor
              value={editedTitle}
              onChange={setEditedTitle}
              onSave={handleSaveTitle}
              onCancel={handleCancelTitleEdit}
              isLoading={isUpdatingQuiz}
            />
          ) : (
            <QuizTitleDisplay title={quiz.title} onEdit={handleEditTitle} />
          )}
        </Space>

        <QuizActions 
          onTakeQuiz={onTakeQuiz}
          onCreateSession={handleCreateSession}
          onBack={handleReturnQuiz}
        />
      </Flex>

      <CreateQuizSessionModal ref={createSessionModalRef} />
    </Flex>
  );
};

export default QuizHeader;
