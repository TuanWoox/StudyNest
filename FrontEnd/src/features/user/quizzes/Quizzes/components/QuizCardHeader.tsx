import React from "react";
import { Typography, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface QuizCardHeaderProps {
  title: string;
  noteTitle: string;
  onDelete: () => void;
  isDeleting: boolean;
}

const QuizCardHeader: React.FC<QuizCardHeaderProps> = ({
  title,
  noteTitle,
  onDelete,
  isDeleting,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
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
            height: "2.8em", // Fixed height for 2 lines
          }}
        >
          {title}
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: 13,
            display: "block",
            marginBottom: 4,
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Source: {noteTitle}
        </Text>
      </div>
      <Button
        danger
        type="text"
        icon={<DeleteOutlined />}
        size="middle"
        loading={isDeleting}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        style={{
          borderRadius: 0,
          fontFamily: "monospace",
          flexShrink: 0,
        }}
        title="Delete quiz"
      />
    </div>
  );
};

export default QuizCardHeader;
