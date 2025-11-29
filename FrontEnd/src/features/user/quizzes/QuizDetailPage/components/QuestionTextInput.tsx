import React from "react";
import { Input, Typography } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

interface QuestionTextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Question text input with character counter
 * Textarea for entering question text with validation
 */
export const QuestionTextInput: React.FC<QuestionTextInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <Text strong style={{ fontFamily: "monospace", display: "block", marginBottom: 8 }}>
        Question Text
      </Text>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your question here..."
        autoSize={{ minRows: 2, maxRows: 4 }}
        maxLength={300}
        showCount
        disabled={disabled}
        style={{
          fontFamily: "monospace",
        }}
        status={error ? "error" : undefined}
      />
      {error && (
        <Text type="danger" style={{ fontSize: 12, fontFamily: "monospace", marginTop: 4, display: "block" }}>
          {error}
        </Text>
      )}
    </div>
  );
};
