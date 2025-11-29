import React from "react";
import { Typography, theme } from "antd";

const { Title, Text } = Typography;
const { useToken } = theme;

const QuizHeader: React.FC = () => {
  const { token } = useToken();
  
  return (
    <div style={{ marginBottom: 24 }}>
      <Title
        level={2}
        style={{
          margin: 0,
          fontWeight: 700,
          fontFamily: "monospace",
        }}
      >
        My Quizzes
      </Title>
      <Text
        type="secondary"
        style={{
          fontSize: 15,
          marginTop: 4,
          display: "block",
          fontFamily: "monospace",
        }}
      >
        Manage and retake your created quizzes
      </Text>
    </div>
  );
};

export default QuizHeader;
