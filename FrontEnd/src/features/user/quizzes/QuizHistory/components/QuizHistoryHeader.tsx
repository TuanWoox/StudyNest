import React from "react";
import { Typography, Button, Space, Grid } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface QuizHistoryHeaderProps {
  quizTitle: string;
  onBack: () => void;
}

const QuizHistoryHeader: React.FC<QuizHistoryHeaderProps> = ({
  quizTitle,
  onBack,
}) => {
  const screens = useBreakpoint();

  return (
    <div
      style={{
        marginBottom: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            Quiz History
          </Title>

          <Text
            style={{
              fontSize: screens.md ? 16 : 14,
              fontFamily: "monospace",
              fontWeight: 500,
              display: "block",
            }}
          >
            Review your quiz attempts and learning progress
          </Text>
        </div>


        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{
            fontFamily: "monospace",
            borderRadius: 0,
            fontWeight: 600,
          }}
        >
          Back to Quizzes
        </Button>
      </div>

      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Text
          style={{
            fontSize: screens.md ? 16 : 14,
            fontFamily: "monospace",
            fontWeight: 500,
            display: "block",
          }}
        >
          {quizTitle}
        </Text>

      </Space>
    </div>
  );
};

export default QuizHistoryHeader;
