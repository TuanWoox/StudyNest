import React from "react";
import { Card, Typography, Space, Row, Col, theme } from "antd";
import type { CreateQuizDTO } from "@/types/quiz/createQuizDTO";

const { Title, Text } = Typography;
const { useToken } = theme;

interface QuizConfigSummaryProps {
  quizOptions: CreateQuizDTO;
}

export const QuizConfigSummary: React.FC<QuizConfigSummaryProps> = ({
  quizOptions,
}) => {
  const { token } = useToken();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return token.colorSuccess;
      case 'medium':
        return token.colorWarning;
      case 'hard':
        return token.colorError;
      default:
        return token.colorWarning;
    }
  };
  
  const getDifficultyBgColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return token.colorSuccessBg;
      case 'medium':
        return token.colorWarningBg;
      case 'hard':
        return token.colorErrorBg;
      default:
        return token.colorWarningBg;
    }
  };

  const totalQuestions =
    (quizOptions?.count_Mcq || 0) +
    (quizOptions?.count_Msq || 0) +
    (quizOptions?.count_Tf || 0);

  return (
    <div>
      <Title level={4} style={{ fontFamily: "monospace", fontWeight: 700 }}>
        Quiz Configuration
      </Title>
      <Text
        type="secondary"
        style={{
          display: "block",
          marginBottom: 16,
          fontFamily: "monospace",
        }}
      >
        Your quiz will be generated with these settings
      </Text>

      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* Settings Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: token.colorPrimaryBg,
                borderRadius: 0,
                border: borderColor,
                boxShadow: shadowColor,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: token.colorPrimary,
                  fontFamily: "monospace",
                }}
              >
                {totalQuestions}
              </div>
              <Text type="secondary" style={{ fontFamily: "monospace" }}>
                Total Questions
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: getDifficultyBgColor(quizOptions.difficulty),
                borderRadius: 0,
                border: borderColor,
                boxShadow: shadowColor,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: getDifficultyColor(quizOptions.difficulty),
                  fontFamily: "monospace",
                }}
              >
                {cap(quizOptions.difficulty)}
              </div>
              <Text type="secondary" style={{ fontFamily: "monospace" }}>
                Difficulty
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: token.colorSuccessBg,
                borderRadius: 0,
                border: borderColor,
                boxShadow: shadowColor,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: token.colorSuccess,
                  fontFamily: "monospace",
                }}
              >
                {quizOptions.language}
              </div>
              <Text type="secondary" style={{ fontFamily: "monospace" }}>
                Language
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Question Distribution */}
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ fontSize: 16, fontFamily: "monospace" }}>
            Question Distribution
          </Text>
          <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
            <Col xs={24} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: token.colorPrimaryBg,
                  borderRadius: 0,
                  border: borderColor,
                  boxShadow: shadowColor,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: token.colorPrimary,
                    fontFamily: "monospace",
                  }}
                >
                  {quizOptions.count_Mcq}
                </div>
                <Text style={{ fontFamily: "monospace" }}>
                  Multiple Choice
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: token.colorInfoBg,
                  borderRadius: 0,
                  border: borderColor,
                  boxShadow: shadowColor,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: token.colorInfo,
                    fontFamily: "monospace",
                  }}
                >
                  {quizOptions.count_Msq}
                </div>
                <Text style={{ fontFamily: "monospace" }}>Multi-Select</Text>
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: token.colorSuccessBg,
                  borderRadius: 0,
                  border: borderColor,
                  boxShadow: shadowColor,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    color: token.colorSuccess,
                    fontFamily: "monospace",
                  }}
                >
                  {quizOptions.count_Tf}
                </div>
                <Text style={{ fontFamily: "monospace" }}>True/False</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Space>
    </div>
  );
};
