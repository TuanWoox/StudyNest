import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Space,
  Dropdown,
  Popconfirm,
  Tag,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { QuizList } from "@/types/quiz/quiz";
import { formatDMY } from "@/utils/date";

const { Title, Text } = Typography;
const { useToken } = theme;

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
  const isMobile = window.innerWidth < 576;
  const isTablet = window.innerWidth < 768;

  const menuItems: MenuProps["items"] = [
    {
      key: "delete",
      label: (
        <Popconfirm
          title="Delete this quiz?"
          description="This action cannot be undone."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
            loading: deletingId === quiz.id && isDeleting,
          }}
          onConfirm={() => onDelete(quiz.id)}
        >
          <span>
            <DeleteOutlined /> Delete
          </span>
        </Popconfirm>
      ),
      danger: true,
    },
  ];

  return (
    <Card
      hoverable
      style={{
        borderRadius: isMobile ? token.borderRadius : token.borderRadiusLG,
        overflow: "hidden",
        height: "100%",
        position: "relative",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: token.boxShadow,
      }}
      styles={{
        body: {
          padding: isMobile ? 16 : isTablet ? 20 : 24,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
      className="quiz-card"
    >
      {/* Solid Top Border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: token.colorPrimary,
        }}
      />

      {/* Card Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isMobile ? 12 : 16,
          marginTop: 8,
        }}
      >
        <div
          style={{
            backgroundColor: token.colorPrimary,
            borderRadius: isMobile ? token.borderRadiusSM : token.borderRadius,
            padding: isMobile ? "6px 12px" : "8px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text
            strong
            style={{
              color: token.colorTextLightSolid,
              fontSize: isMobile ? 13 : 15,
              fontWeight: 700,
            }}
          >
            #{(page - 1) * pageSize + index + 1}
          </Text>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            size={isMobile ? "small" : "middle"}
            style={{
              marginTop: -4,
              borderRadius: "50%",
              width: 32,
              height: 32,
            }}
            className="quiz-more-btn"
          />
        </Dropdown>
      </div>

      {/* Quiz Title */}
      <Link to={`/user/quiz/${quiz.id}`} style={{ textDecoration: "none" }}>
        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: `0 0 ${isMobile ? 16 : 20}px 0`,
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: isMobile ? 44 : 50,
            transition: "color 0.3s ease",
          }}
          className="quiz-title"
        >
          {quiz.title}
        </Title>
      </Link>

      {/* Center Icon */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: isMobile ? "12px 0" : "16px 0 20px 0",
        }}
      >
        <div
          style={{
            width: isMobile ? 70 : 90,
            height: isMobile ? 70 : 90,
            borderRadius: "50%",
            backgroundColor: token.colorPrimaryBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${token.colorPrimary}`,
          }}
        >
          <FileTextOutlined
            style={{
              fontSize: isMobile ? 32 : 40,
              color: token.colorPrimary,
            }}
          />
        </div>
      </div>

      {/* Quiz Info */}
      <div
        style={{
          backgroundColor: token.colorFillTertiary,
          borderRadius: isMobile ? token.borderRadiusSM : token.borderRadiusLG,
          padding: isMobile ? "12px 14px" : "16px 18px",
          marginBottom: isMobile ? 16 : 20,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <Space
          direction="vertical"
          size={isMobile ? 10 : 12}
          style={{ width: "100%" }}
        >
          <div
            className="quiz-info-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 12,
            }}
          >
            <div
              style={{
                width: isMobile ? 36 : 40,
                height: isMobile ? 36 : 40,
                borderRadius: isMobile
                  ? token.borderRadiusSM
                  : token.borderRadius,
                backgroundColor: token.colorPrimaryBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined
                style={{
                  color: token.colorPrimary,
                  fontSize: isMobile ? 16 : 18,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 11 : 12,
                  display: "block",
                  lineHeight: 1.3,
                  fontWeight: 500,
                }}
              >
                Questions
              </Text>
              <Text
                strong
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                }}
              >
                {quiz.totalQuestion}
              </Text>
            </div>
          </div>
          {quiz.noteTitle && (
            <div
              className="quiz-info-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 10 : 12,
              }}
            >
              <div
                style={{
                  width: isMobile ? 36 : 40,
                  height: isMobile ? 36 : 40,
                  borderRadius: isMobile
                    ? token.borderRadiusSM
                    : token.borderRadius,
                  backgroundColor: token.colorPrimaryBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOutlined
                  style={{
                    color: token.colorPrimary,
                    fontSize: isMobile ? 16 : 18,
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    display: "block",
                    lineHeight: 1.3,
                    fontWeight: 500,
                  }}
                >
                  Source Note
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={quiz.noteTitle}
                >
                  {quiz.noteTitle}
                </Text>
              </div>
            </div>
          )}
          <div
            className="quiz-info-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 12,
            }}
          >
            <div
              style={{
                width: isMobile ? 36 : 40,
                height: isMobile ? 36 : 40,
                borderRadius: isMobile
                  ? token.borderRadiusSM
                  : token.borderRadius,
                backgroundColor: token.colorPrimaryBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarOutlined
                style={{
                  color: token.colorPrimary,
                  fontSize: isMobile ? 16 : 18,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? 11 : 12,
                  display: "block",
                  lineHeight: 1.3,
                  fontWeight: 500,
                }}
              >
                Created
              </Text>
              <Text
                strong
                style={{
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                }}
              >
                {formatDMY(quiz.dateCreated)}
              </Text>
            </div>
          </div>
        </Space>
      </div>

      {/* Action Buttons */}
      <Space size={isMobile ? 8 : 10} style={{ width: "100%" }}>
        <Link to={`/user/quiz/${quiz.id}`} style={{ flex: 1 }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="large"
            style={{
              width: "100%",
              borderRadius: isMobile
                ? token.borderRadiusSM
                : token.borderRadius,
              height: isMobile ? 44 : 44,
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
            }}
            className="quiz-view-btn"
          >
            View
          </Button>
        </Link>
        <Link to={`/user/quizAttempt/${quiz.id}`} style={{ flex: 1 }}>
          <Button
            icon={<PlayCircleOutlined />}
            size="large"
            style={{
              width: "100%",
              borderRadius: isMobile
                ? token.borderRadiusSM
                : token.borderRadius,
              height: isMobile ? 44 : 44,
              fontWeight: 600,
              fontSize: isMobile ? 14 : 15,
              borderWidth: 2,
            }}
            className="quiz-start-btn"
          >
            Start
          </Button>
        </Link>
      </Space>
    </Card>
  );
};

export default QuizCard;
