import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Space, Button, Tag, Grid, theme, Progress } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { selectQuizAttemptDTO } from "@/types/quizAttemptAnswer/selectQuizAttemptDTO";
import { formatDMY } from "@/utils/date";

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;

interface QuizHistoryItemProps {
  attempt: selectQuizAttemptDTO;
  quizId: string;
  index: number;
}

const QuizHistoryItem: React.FC<QuizHistoryItemProps> = ({
  attempt,
  quizId,
  index,
}) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { token } = useToken();

  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  // Calculate total score from score (assuming score is already a percentage or total)
  // We'll use score as the actual score and assume total is 100 for percentage calculation
  const scorePercentage = attempt.score; // score is already 0-100
  const isHighScore = scorePercentage >= 80;
  const isMediumScore = scorePercentage >= 50 && scorePercentage < 80;

  const getScoreColor = () => {
    if (isHighScore) return token.colorSuccess;
    if (isMediumScore) return token.colorWarning;
    return token.colorError;
  };

  const handleViewResult = () => {
    navigate(`/user/quiz/quizAttemptResult/${attempt.id}`, {
      state: { fromHistory: true },
    });
  };

  return (
    <Card
      hoverable
      style={{
        border: borderColor,
        borderRadius: 0,
        boxShadow: shadowColor,
        transition: "all 0.3s ease",
      }}
      styles={{
        body: {
          padding: screens.md ? "20px" : "16px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `6px 6px 0px ${token.colorPrimary}55`;
        e.currentTarget.style.transform = "translate(-2px, -2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowColor;
        e.currentTarget.style.transform = "translate(0, 0)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* Left Section - Attempt Info */}
        <Space direction="vertical" size={12} style={{ flex: 1, minWidth: 200 }}>
          <Space align="center" size={12}>
            <Tag
              color={token.colorPrimary}
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                fontSize: screens.md ? 14 : 13,
                padding: "4px 12px",
                borderRadius: 0,
              }}
            >
              Attempt #{index + 1}
            </Tag>
            <Text
              style={{
                fontSize: screens.md ? 24 : 20,
                fontWeight: 700,
                fontFamily: "monospace",
                color: getScoreColor(),
              }}
            >
              {attempt.score.toFixed(1)}%
            </Text>
          </Space>

          <Progress
            percent={scorePercentage}
            strokeColor={getScoreColor()}
            showInfo={false}
            style={{ marginBottom: 4 }}
          />

          <Space
            direction={screens.xs ? "vertical" : "horizontal"}
            size={screens.md ? 24 : 12}
            style={{ width: "100%" }}
          >
            <Space size={8}>
              <CalendarOutlined style={{ color: token.colorTextSecondary }} />
              <Text
                type="secondary"
                style={{ fontFamily: "monospace", fontSize: screens.md ? 14 : 13 }}
              >
                {formatDMY(attempt.dateCreated || "")}
              </Text>
            </Space>

            <Space size={8}>
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
              <Text
                style={{ fontFamily: "monospace", fontSize: screens.md ? 14 : 13 }}
              >
                Score: {attempt.score.toFixed(1)}%
              </Text>
            </Space>

          </Space>
        </Space>

        {/* Right Section - Action Button */}
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={handleViewResult}
          size="large"
          style={{
            fontFamily: "monospace",
            fontWeight: 600,
            borderRadius: 0,
            minWidth: screens.md ? 150 : 120,
          }}
        >
          View Result
        </Button>
      </div>
    </Card>
  );
};

export default QuizHistoryItem;
