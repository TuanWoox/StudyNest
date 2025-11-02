import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Typography, Space, Popconfirm, theme, Grid } from "antd";
import type { MenuProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { QuizList } from "@/types/quiz/quiz";
import { formatDMY } from "@/utils/date";

const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

interface QuizCardProps {
  quiz: QuizList;
  index: number;
  page: number;
  pageSize: number;
  onDelete: (quizId: string) => void;
  deletingId: string | null;
  isDeleting: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  index,
  page,
  pageSize,
  onDelete,
  deletingId,
  isDeleting,
}) => {
  const { token } = useToken();
  const screens = useBreakpoint();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <Card
      hoverable
      onClick={(e) => {
        // Prevent card click if clicking on buttons
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) {
          return;
        }
      }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        border: borderColor,
        borderRadius: 0,
        boxShadow: shadowColor,
        backgroundColor: token.colorBgContainer,
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: screens.md ? "20px" : "16px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `6px 6px 0px ${token.colorPrimary}55`;
        e.currentTarget.style.transform = "translate(-2px, -4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowColor;
        e.currentTarget.style.transform = "translate(0, 0)";
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1, paddingRight: 8 }}>
          <Title
            level={5}
            style={{
              margin: 0,
              marginBottom: 8,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            {quiz.title}
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: 13,
              display: "block",
              marginBottom: 4,
              fontFamily: "monospace",
            }}
          >
            Source: {quiz.noteTitle}
          </Text>
        </div>
      </div>

      {/* Quiz Info */}
      <div style={{ flex: 1, marginBottom: 16 }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontFamily: "monospace" }}>
              Questions:
            </Text>
            <Text strong style={{ fontSize: 16, fontFamily: "monospace" }}>
              {quiz.totalQuestion}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text type="secondary" style={{ fontFamily: "monospace" }}>
              Created:
            </Text>
            <Text strong style={{ fontSize: 14, fontFamily: "monospace" }}>
              {formatDMY(quiz.dateCreated)}
            </Text>
          </div>
        </Space>
      </div>

      {/* Actions */}
      <div
        style={{
          paddingTop: 16,
          borderTop: `1px solid ${token.colorPrimary}88`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <Link to={`/user/quiz/quizAttempt/${quiz.id}`} style={{ flex: 1 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              block
              size="middle"
              style={{
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {!screens.xs && "Take Quiz"}
            </Button>
          </Link>
          <Link to={`/user/quiz/${quiz.id}`} style={{ flex: 1 }}>
            <Button
              icon={<EyeOutlined />}
              block
              size="middle"
              style={{
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              {!screens.xs && "Details"}
            </Button>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            <Button
              danger
              type="default"
              icon={<DeleteOutlined />}
              size="middle"
              loading={deletingId === quiz.id && isDeleting}
              disabled={isDeleting && deletingId !== quiz.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(quiz.id);
              }}
              style={{
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 600,
                minWidth: "44px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
              title="Delete quiz"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuizCard;
