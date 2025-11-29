import React from "react";
import { Button, Space, Typography } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

/**
 * Form action buttons with keyboard shortcuts
 * Save and Cancel buttons for question form
 */
export const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  return (
    <Space size="middle" style={{ width: "100%" }}>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={onSave}
        loading={isLoading}
        size="large"
        style={{
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {isEditing ? "Update Question" : "Add Question"}
      </Button>
      <Button
        icon={<CloseOutlined />}
        onClick={onCancel}
        disabled={isLoading}
        size="large"
        style={{
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        Cancel
      </Button>
      <Text
        type="secondary"
        style={{ fontSize: 12, marginLeft: 8, fontFamily: "monospace" }}
      >
        Press <kbd>Ctrl+S</kbd> to save • <kbd>Esc</kbd> to cancel
      </Text>
    </Space>
  );
};
