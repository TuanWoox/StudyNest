import React from "react";
import { Typography, Space, theme } from "antd";

const { Text } = Typography;
const { useToken } = theme;

interface QuizCardInfoProps {
  totalQuestions: number;
  dateCreated: string;
  difficulty: string;
}

const QuizCardInfo: React.FC<QuizCardInfoProps> = ({
  totalQuestions,
  dateCreated,
  difficulty,
}) => {
  const { token } = useToken();
  
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return token.colorSuccess;
      case 'medium':
        return token.colorWarning;
      case 'hard':
        return token.colorError;
      default:
        return token.colorText;
    }
  };
  
  return (
    <div style={{ flex: 1, marginBottom: 16 }}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            gap: "8px 16px",
            alignItems: "center",
          }}
        >
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            Questions:
          </Text>
          <Text strong style={{ fontSize: 16, fontFamily: "monospace", textAlign: "right" }}>
            {totalQuestions}
          </Text>
          
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            Created:
          </Text>
          <Text strong style={{ fontSize: 14, fontFamily: "monospace", textAlign: "right" }}>
            {dateCreated}
          </Text>
          
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            Difficulty:
          </Text>
          <Text strong style={{ fontSize: 14, fontFamily: "monospace", textTransform: "capitalize", textAlign: "right", color: getDifficultyColor(difficulty) }}>
            {difficulty}
          </Text>
        </div>
      </Space>
    </div>
  );
};

export default QuizCardInfo;
