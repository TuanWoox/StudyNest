import React, { useMemo } from "react";
import { Input, Typography, theme } from "antd";

const { TextArea } = Input;
const { Text } = Typography;
const { useToken } = theme;

interface ExplanationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Explanation input component with word count validation
 * Optional textarea for providing explanation text (max 200 words)
 */
export const ExplanationInput: React.FC<ExplanationInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { token } = useToken();

  // Count words (matching backend logic)
  const wordCount = useMemo(() => {
    if (!value || !value.trim()) return 0;
    return value
      .trim()
      .split(/[\s\n\r\t]+/)
      .filter(Boolean).length;
  }, [value]);

  const maxWords = 200;
  const isExceeded = wordCount > maxWords;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong style={{ fontFamily: "monospace" }}>
          Explanation (Optional)
        </Text>
        <Text
          type={isExceeded ? "danger" : wordCount > maxWords * 0.8 ? "warning" : "secondary"}
          style={{ fontSize: 12, fontFamily: "monospace" }}
        >
          {wordCount} / {maxWords} words
        </Text>
      </div>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Provide an explanation for the correct answer (maximum 200 words)..."
        autoSize={{ minRows: 2, maxRows: 4 }}
        disabled={disabled}
        status={isExceeded ? "error" : undefined}
        style={{
          fontFamily: "monospace",
          borderColor: isExceeded ? token.colorError : undefined,
        }}
      />
      {isExceeded && (
        <Text
          type="danger"
          style={{
            fontSize: 14,
            fontFamily: "monospace",
            display: "block",
            marginTop: 4,
          }}
        >
          ⚠ Explanation exceeds {maxWords} words limit
        </Text>
      )}
    </div>
  );
};
