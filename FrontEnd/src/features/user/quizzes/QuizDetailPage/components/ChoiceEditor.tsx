// ChoiceEditor component for editing question choices

import React from "react";
import { Space, Typography } from "antd";
import type { Choice } from "@/types/quiz/quiz";
import { ChoiceInput } from "./ChoiceInput";
import { ChoiceValidationHint } from "./ChoiceValidationHint";

const { Text } = Typography;

interface ChoiceEditorProps {
  type: "MCQ" | "MSQ" | "TF";
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
  disabled?: boolean;
}

export const ChoiceEditor: React.FC<ChoiceEditorProps> = ({
  type,
  choices,
  onChange,
  disabled = false,
}) => {
  const handleTextChange = (index: number, text: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], text };
    onChange(newChoices);
  };

  const handleCorrectChange = (index: number, isCorrect: boolean) => {
    const newChoices = [...choices];

    if (type === "MCQ" || type === "TF") {
      // For MCQ and TF, only one can be correct (radio behavior)
      newChoices.forEach((choice, i) => {
        newChoices[i] = {
          ...choice,
          isCorrect: i === index ? isCorrect : false,
        };
      });
    } else {
      // For MSQ, multiple can be correct (checkbox behavior)
      newChoices[index] = { ...newChoices[index], isCorrect };
    }

    onChange(newChoices);
  };

  const correctCount = choices.filter((c) => c.isCorrect).length;

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={12}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong style={{ fontFamily: "monospace" }}>
          Answer Choices
        </Text>
        <Text
          type="secondary"
          style={{ fontSize: 12, fontFamily: "monospace" }}
        >
          {type === "MCQ" && `Select 1 correct answer (${correctCount} selected)`}
          {type === "MSQ" && `Select 2+ correct answers (${correctCount} selected)`}
          {type === "TF" && `Select 1 correct answer (${correctCount} selected)`}
        </Text>
      </div>

      {choices.map((choice, index) => (
        <ChoiceInput
          key={index}
          choice={choice}
          index={index}
          type={type}
          onTextChange={handleTextChange}
          onCorrectChange={handleCorrectChange}
          disabled={disabled}
        />
      ))}

      {/* Validation hints */}
      <ChoiceValidationHint type={type} choices={choices} />
    </Space>
  );
};
