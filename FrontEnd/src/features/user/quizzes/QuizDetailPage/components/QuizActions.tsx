import React from "react";
import { Space, Button } from "antd";
import { FormOutlined, ArrowLeftOutlined } from "@ant-design/icons";

interface QuizActionsProps {
  onTakeQuiz: () => void;
  onBack: () => void;
}

export const QuizActions: React.FC<QuizActionsProps> = ({
  onTakeQuiz,
  onBack,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Space wrap>
      <Button
        type="primary"
        icon={<FormOutlined />}
        onClick={onTakeQuiz}
        size={isMobile ? "middle" : "large"}
        style={{
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {!isMobile && "Take Quiz"}
      </Button>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        size={isMobile ? "middle" : "large"}
        style={{
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {!isMobile && "Back"}
      </Button>
    </Space>
  );
};
