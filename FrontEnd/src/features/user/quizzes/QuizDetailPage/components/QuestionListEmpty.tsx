import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import { EmptyState } from "@/components/EmptyState/EmptyState";

interface QuestionListEmptyProps {
  onAddQuestion: () => void;
}

export const QuestionListEmpty: React.FC<QuestionListEmptyProps> = ({
  onAddQuestion,
}) => {
  return (
    <EmptyState
      type="info"
      title="No Questions Yet"
      description="Click 'Add Question' to create your first question and start building your quiz!"
      actionLabel="Add Your First Question"
      actionIcon={<PlusOutlined />}
      onAction={onAddQuestion}
    />
  );
};
