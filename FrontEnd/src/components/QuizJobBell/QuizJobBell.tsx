import { useMemo } from "react";
import { Badge, Dropdown, MenuProps, Tooltip, Typography, theme } from "antd";
import {
  BellOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuizJobContext } from "@/context/QuizJobProvider/QuizJobContextValue";
import { formatDMY } from "@/utils/date";

const { Text } = Typography;
const { useToken } = theme;

function statusTag(
  status: "processing" | "success" | "error",
  tokenColors: any
) {
  const iconStyle = {
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
  };

  switch (status) {
    case "processing":
      return (
        <div
          style={{
            ...iconStyle,
            backgroundColor: `${tokenColors.colorPrimary}20`,
            color: tokenColors.colorPrimary,
          }}
        >
          <HourglassOutlined className="rotate-center" />
        </div>
      );
    case "success":
      return (
        <div
          style={{
            ...iconStyle,
            backgroundColor: `${tokenColors.colorSuccess}20`,
            color: tokenColors.colorSuccess,
          }}
        >
          <CheckCircleOutlined />
        </div>
      );
    case "error":
      return (
        <div
          style={{
            ...iconStyle,
            backgroundColor: `${tokenColors.colorError}20`,
            color: tokenColors.colorError,
          }}
        >
          <CloseCircleOutlined />
        </div>
      );
  }
}

export default function QuizJobBell() {
  const { jobs, unreadCount, markViewed, connectionStatus, isLoading } =
    useQuizJobContext();
  const navigate = useNavigate();
  const { token } = useToken();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  // chỉ lấy 8 job gần nhất để menu gọn
  const topJobs = useMemo(() => jobs.slice(0, 8), [jobs]);

  const items: MenuProps["items"] = topJobs.map((j) => ({
    key: j.jobId,
    label: (
      <Tooltip
        title={
          j.status === "error" && j.errorMessage
            ? `Error: ${j.errorMessage}`
            : j.status === "success"
              ? "Click to view quiz"
              : "Quiz is being created..."
        }
        placement="left"
        overlayStyle={{
          fontFamily: "'Courier New', monospace",
          maxWidth: 300,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: j.status === "success" ? "pointer" : "default",
            opacity: j.status === "processing" ? 0.9 : 1,
            transition: "all 0.2s ease",
            fontFamily: "monospace",
          }}
          onClick={(e) => {
            // Nếu đã success thì điều hướng; đồng thời markViewed
            if (j.status === "success" && j.quizId) {
              markViewed(j.jobId);
              navigate(`/user/quiz/${j.quizId}`);
            }
            e.stopPropagation();
          }}
          onMouseEnter={(e) => {
            if (j.status === "error") {
              markViewed(j.jobId);
            }
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {statusTag(j.status, token)}
          <div
            style={{
              marginLeft: "15px",
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Text
              strong
              ellipsis
              style={{ maxWidth: 220, fontFamily: "monospace" }}
            >
              {j.noteTitle}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: 12, fontFamily: "monospace" }}
            >
              {formatDMY(j.timestamp)}
            </Text>
          </div>
        </div>
      </Tooltip>
    ),
  }));

  // Khi không có job
  if (items.length === 0) {
    items.push({
      key: "empty",
      disabled: true,
      label: (
        <Text type="secondary" style={{ fontFamily: "monospace" }}>
          No generating quiz
        </Text>
      ),
    });
  }

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items,
        style: {
          border: borderColor,
          borderRadius: 0,
          boxShadow: shadowColor,
          backgroundColor: token.colorBgElevated,
          fontFamily: "monospace",
        },
      }}
      placement="bottomRight"
      overlayStyle={{ minWidth: 340, height: "fit-content" }}
    >
      <Badge
        count={unreadCount}
        size="small"
        offset={[-2, 2]}
        dot={connectionStatus === "reconnecting"}
        status={
          connectionStatus === "connected"
            ? undefined
            : connectionStatus === "reconnecting"
              ? "warning"
              : "default"
        }
      >
        <button
          aria-label="Quiz jobs"
          disabled={isLoading}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            border: `2px solid ${token.colorBorder}`,
            display: "grid",
            placeItems: "center",
            cursor: isLoading ? "wait" : "pointer",
            background: token.colorBgContainer,
            transition: "all 0.3s ease",
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = token.colorPrimary;
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = token.colorBorder;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <BellOutlined
            style={{ fontSize: 18 }}
            spin={connectionStatus === "reconnecting"}
          />
        </button>
      </Badge>
    </Dropdown>
  );
}
