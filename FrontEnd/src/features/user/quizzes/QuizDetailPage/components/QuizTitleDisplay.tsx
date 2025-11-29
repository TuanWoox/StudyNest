import React from "react";
import { Space, Typography, Button, theme } from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { useToken } = theme;

interface QuizTitleDisplayProps {
  title: string;
  onEdit: () => void;
}

export const QuizTitleDisplay: React.FC<QuizTitleDisplayProps> = ({
  title,
  onEdit,
}) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Space style={{ overflow: "hidden" }}>
      <Title
        level={3}
        style={{
          margin: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: isMobile ? "200px" : "500px",
          fontFamily: "monospace",
          fontWeight: 700,
        }}
        title={title}
      >
        {title}
      </Title>
      <Button
        icon={<EditOutlined />}
        onClick={onEdit}
        type="text"
        style={{
          color: token.colorPrimary,
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
        size={isMobile ? "small" : "middle"}
      >
        {!isMobile && "Edit"}
      </Button>
    </Space>
  );
};
