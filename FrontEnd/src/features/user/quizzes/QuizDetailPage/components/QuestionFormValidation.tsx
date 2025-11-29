import React, { useMemo } from "react";
import { Alert, Space } from "antd";
import { validateQuestion } from "@/utils/validation";
import type { Choice } from "@/types/quiz/quiz";

interface QuestionFormValidationProps {
  name: string;
  type: string;
  explanation: string;
  choices: Choice[];
  isUpdate?: boolean;
  questionId?: string;
  showValidation?: boolean;
}

/**
 * Real-time validation display for question form
 * Shows all validation errors to help user fix issues before submit
 */
export const QuestionFormValidation: React.FC<QuestionFormValidationProps> = ({
  name,
  type,
  explanation,
  choices,
  isUpdate = false,
  questionId,
  showValidation = true,
}) => {
  // Collect all validation errors
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Skip validation if showValidation is false
    if (!showValidation) return errors;

    // Question title validation
    if (!name || name.trim().length === 0) {
      errors.push("Question title is required");
    } else if (name.trim().length > 300) {
      errors.push("Question title must not exceed 300 characters");
    }

    // Question type validation
    if (!type || type.trim().length === 0) {
      errors.push("Question type is required (MCQ, MSQ, or TF)");
    }

    // Choice validation - only if we have choices
    if (choices.length > 0) {
      // Validate each choice text
      choices.forEach((choice, index) => {
        if (!choice.text || choice.text.trim().length === 0) {
          errors.push(`Choice ${index + 1}: Text content is required`);
        } else if (choice.text.trim().length > 200) {
          errors.push(`Choice ${index + 1}: Text must not exceed 200 characters`);
        }
      });

      // Check for duplicate choices
      const textMap = new Map<string, number[]>();
      choices.forEach((choice, index) => {
        const normalizedText = (choice.text || "").trim().toLowerCase();
        if (normalizedText) {
          if (!textMap.has(normalizedText)) {
            textMap.set(normalizedText, []);
          }
          textMap.get(normalizedText)!.push(index + 1);
        }
      });

      textMap.forEach((indices, text) => {
        if (indices.length > 1) {
          errors.push(
            `Duplicate choice text "${text}" found at positions: ${indices.join(", ")}`
          );
        }
      });

      // Type-specific validation
      const typeUpper = type.trim().toUpperCase();
      const correctCount = choices.filter((c) => c.isCorrect).length;

      switch (typeUpper) {
        case "MCQ":
          if (choices.length !== 4) {
            errors.push("MCQ must have exactly 4 choices");
          }
          if (correctCount !== 1) {
            errors.push(
              `MCQ must have exactly 1 correct answer (currently: ${correctCount})`
            );
          }
          break;

        case "MSQ":
          if (choices.length !== 4) {
            errors.push("MSQ must have exactly 4 choices");
          }
          if (correctCount < 2) {
            errors.push(
              `MSQ must have at least 2 correct answers (currently: ${correctCount})`
            );
          }
          break;

        case "TF":
          if (choices.length !== 2) {
            errors.push("TF question must have exactly 2 choices");
          } else {
            const hasTrue = choices.some(
              (c) => c.text?.trim().toLowerCase() === "true"
            );
            const hasFalse = choices.some(
              (c) => c.text?.trim().toLowerCase() === "false"
            );
            if (!hasTrue || !hasFalse) {
              errors.push("TF question must contain only 'True' and 'False' as choices");
            }
          }
          if (correctCount !== 1) {
            errors.push(
              `TF question must have exactly 1 correct answer (currently: ${correctCount})`
            );
          }
          break;
      }
    }

    // Explanation validation (optional field, only check if provided)
    if (explanation && explanation.trim().length > 0) {
      const wordCount = explanation
        .trim()
        .split(/[\s\n\r\t]+/)
        .filter(Boolean).length;
      if (wordCount > 200) {
        errors.push(
          `Explanation must be concise (max 200 words, currently: ${wordCount})`
        );
      }
    }

    return errors;
  }, [name, type, explanation, choices, isUpdate, questionId, showValidation]);

  // Don't show anything if validation is disabled or no errors
  if (!showValidation || validationErrors.length === 0) {
    return null;
  }

  return (
    <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
      <Alert
        message="Validation Errors"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index} style={{ fontFamily: "monospace", fontSize: 13 }}>
                {error}
              </li>
            ))}
          </ul>
        }
        type="error"
        showIcon
        style={{ fontFamily: "monospace" }}
      />
    </Space>
  );
};
