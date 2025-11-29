import React from "react";
import { Input, Checkbox, Radio, Typography, theme } from "antd";
import type { Choice } from "@/types/quiz/quiz";

const { Text } = Typography;
const { useToken } = theme;

interface ChoiceInputProps {
  choice: Choice;
  index: number;
  type: "MCQ" | "MSQ" | "TF";
  onTextChange: (index: number, text: string) => void;
  onCorrectChange: (index: number, isCorrect: boolean) => void;
  disabled?: boolean;
}

/**
 * Single choice input row with checkbox/radio and text input
 * Handles correct state and text editing for one choice
 */
export const ChoiceInput: React.FC<ChoiceInputProps> = ({
  choice,
  index,
  type,
  onTextChange,
  onCorrectChange,
  disabled = false,
}) => {
  const { token } = useToken();

  // Validation states
  const isEmpty = !choice.text || choice.text.trim().length === 0;
  const isTooLong = choice.text && choice.text.trim().length > 200;
  const hasError = isEmpty || isTooLong;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: choice.isCorrect
          ? token.colorSuccessBg
          : hasError
          ? token.colorErrorBg
          : token.colorFillAlter,
        borderRadius: 0,
        border: hasError
          ? `2px solid ${token.colorError}`
          : choice.isCorrect
          ? `2px solid ${token.colorSuccess}`
          : `1px solid ${token.colorBorder}`,
        boxShadow: hasError
          ? `4px 4px 0px ${token.colorError}55`
          : choice.isCorrect
          ? `4px 4px 0px ${token.colorSuccess}55`
          : "none",
        borderLeft: hasError
          ? `4px solid ${token.colorError}`
          : choice.isCorrect
          ? `4px solid ${token.colorSuccess}`
          : `4px solid ${token.colorFillSecondary}`,
      }}
    >
      {/* Correct indicator - Radio for MCQ/TF, Checkbox for MSQ */}
      {type === "MSQ" ? (
        <Checkbox
          checked={choice.isCorrect}
          onChange={(e) => onCorrectChange(index, e.target.checked)}
          disabled={disabled}
          style={{ flexShrink: 0 }}
        />
      ) : (
        <Radio
          checked={choice.isCorrect}
          onChange={(e) => onCorrectChange(index, e.target.checked)}
          disabled={disabled}
          style={{ flexShrink: 0 }}
        />
      )}

      {/* Choice text input */}
      <Input
        value={choice.text}
        onChange={(e) => onTextChange(index, e.target.value)}
        placeholder={`Choice ${index + 1}`}
        disabled={disabled || type === "TF"} // TF text is fixed
        maxLength={200}
        showCount={!disabled && type !== "TF"}
        style={{ flex: 1, fontFamily: "monospace" }}
        status={hasError ? "error" : undefined}
      />

      {/* Validation or Correct label */}
      {hasError ? (
        <Text
          type="danger"
          style={{
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            minWidth: 60,
            textAlign: "right",
            fontFamily: "monospace",
          }}
        >
          {isEmpty ? "⚠ Empty" : "⚠ Too long"}
        </Text>
      ) : choice.isCorrect ? (
        <Text
          type="success"
          style={{
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
            minWidth: 60,
            textAlign: "right",
            fontFamily: "monospace",
          }}
        >
          ✓ Correct
        </Text>
      ) : null}
    </div>
  );
};
