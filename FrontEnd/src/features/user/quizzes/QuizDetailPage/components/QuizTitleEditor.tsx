import React from "react";
import { Space, Input, Button } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";

interface QuizTitleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const QuizTitleEditor: React.FC<QuizTitleEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  isLoading,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Space wrap>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={300}
        style={{
          width: isMobile ? 200 : 400,
          minWidth: 150,
          fontFamily: "monospace",
          borderRadius: 0,
        }}
        size="large"
        autoFocus
        disabled={isLoading}
        onPressEnter={onSave}
      />
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={onSave}
        size="large"
        loading={isLoading}
        style={{
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {!isMobile && "Save"}
      </Button>
      <Button
        icon={<CloseOutlined />}
        onClick={onCancel}
        size="large"
        disabled={isLoading}
        style={{
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {!isMobile && "Cancel"}
      </Button>
    </Space>
  );
};
