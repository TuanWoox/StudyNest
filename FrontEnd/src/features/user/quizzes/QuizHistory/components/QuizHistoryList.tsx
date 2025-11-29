import React from "react";
import { Space } from "antd";
import type { selectQuizAttemptDTO } from "@/types/quizAttemptAnswer/selectQuizAttemptDTO";
import { QuizHistoryItem } from ".";

interface QuizHistoryListProps {
  attempts: selectQuizAttemptDTO[];
  quizId: string;
}

const QuizHistoryList: React.FC<QuizHistoryListProps> = ({
  attempts,
  quizId,
}) => {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {attempts.map((attempt, index) => (
        <QuizHistoryItem
          key={attempt.id}
          attempt={attempt}
          quizId={quizId}
          index={index}
        />
      ))}
    </Space>
  );
};

export default QuizHistoryList;
