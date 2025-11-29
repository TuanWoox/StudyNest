import React from "react";
import { Select, Space, Typography } from "antd";

const { Option } = Select;
const { Text } = Typography;

interface QuestionTypeSelectorProps {
  value: "MCQ" | "MSQ" | "TF";
  onChange: (value: "MCQ" | "MSQ" | "TF") => void;
  disabled?: boolean;
}

/**
 * Question type selector with descriptions
 * Allows selecting between MCQ, MSQ, and TF question types
 */
export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div>
      <Text strong style={{ fontFamily: "monospace", display: "block", marginBottom: 8 }}>
        Question Type
      </Text>
      <Select
        value={value}
        onChange={onChange}
        disabled={disabled}
        size="large"
        style={{
          fontFamily: "monospace",
          width: "100%",
        }}
      >
        <Option value="MCQ">
          <Space>
            <span>Multiple Choice (MCQ)</span>
          </Space>
        </Option>
        <Option value="MSQ">
          <Space>
            <span>Multi-Select (MSQ)</span>
          </Space>
        </Option>
        <Option value="TF">
          <Space>
            <span>True/False (TF)</span>
          </Space>
        </Option>
      </Select>
    </div>
  );
};
