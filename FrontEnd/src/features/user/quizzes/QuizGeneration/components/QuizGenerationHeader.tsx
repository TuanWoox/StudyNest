import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface QuizGenerationHeaderProps {
  isLoading: boolean;
  isMobile: boolean;
}

export const QuizGenerationHeader: React.FC<QuizGenerationHeaderProps> = ({
  isLoading,
  isMobile,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div>
        <Title
          level={3}
          style={{ margin: 0, fontFamily: "monospace", fontWeight: 700 }}
        >
          Quiz Generation
        </Title>
        <Text type="secondary" style={{ fontFamily: "monospace" }}>
          Create a customized quiz from your notes to test your knowledge
        </Text>
      </div>
      <Link to="/user/quiz">
        <Button
          icon={<ArrowLeftOutlined />}
          disabled={isLoading}
          style={{
            borderRadius: 0,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {!isMobile && "Back to Quizzes"}
        </Button>
      </Link>
    </div>
  );
};
