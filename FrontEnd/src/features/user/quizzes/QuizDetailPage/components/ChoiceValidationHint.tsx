import React from "react";
import { Typography, theme } from "antd";
import type { Choice } from "@/types/quiz/quiz";

const { Text } = Typography;
const { useToken } = theme;

interface ChoiceValidationHintProps {
  type: "MCQ" | "MSQ" | "TF";
  choices?: Choice[];
}

/**
 * Display validation requirements and status for choice editor based on question type
 */
export const ChoiceValidationHint: React.FC<ChoiceValidationHintProps> = ({
  type,
  choices = [],
}) => {
  const { token } = useToken();

  // Calculate validation status
  const correctCount = choices.filter((c) => c.isCorrect).length;
  const choiceCount = choices.length;

  let isValid = false;
  let validationMessage = "";

  switch (type) {
    case "MCQ":
      isValid = choiceCount === 4 && correctCount === 1;
      validationMessage = isValid
        ? "✓ Exactly 4 choices, 1 correct answer required"
        : `⚠ Need: 4 choices (${choiceCount}/4), 1 correct (${correctCount}/1)`;
      break;
    case "MSQ":
      isValid = choiceCount === 4 && correctCount >= 2;
      validationMessage = isValid
        ? "✓ Exactly 4 choices, at least 2 correct answers required"
        : `⚠ Need: 4 choices (${choiceCount}/4), 2+ correct (${correctCount})`;
      break;
    case "TF":
      const hasTrue = choices.some((c) => c.text?.trim().toLowerCase() === "true");
      const hasFalse = choices.some((c) => c.text?.trim().toLowerCase() === "false");
      isValid = choiceCount === 2 && hasTrue && hasFalse && correctCount === 1;
      validationMessage = isValid
        ? "✓ True/False choices with 1 correct answer (fixed text)"
        : `⚠ Need: 2 choices (True/False), 1 correct (${correctCount}/1)`;
      break;
  }

  const bgColor = isValid ? token.colorSuccessBg : token.colorWarningBg;
  const borderColor = isValid
    ? `2px solid ${token.colorSuccess}E0`
    : `2px solid ${token.colorWarning}E0`;
  const shadowColor = isValid
    ? `4px 4px 0px ${token.colorSuccess}55`
    : `4px 4px 0px ${token.colorWarning}55`;
  const textType = isValid ? "success" : "warning";

  return (
    <div
      style={{
        marginTop: 4,
        padding: "8px 12px",
        backgroundColor: bgColor,
        borderRadius: 0,
        border: borderColor,
        boxShadow: shadowColor,
      }}
    >
      <Text type={textType} style={{ fontSize: 12, fontFamily: "monospace" }}>
        {validationMessage}
      </Text>
    </div>
  );
};
