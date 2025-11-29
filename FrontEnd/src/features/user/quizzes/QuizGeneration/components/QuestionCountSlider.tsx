import React from "react";
import { Typography, InputNumber, Slider } from "antd";

const { Title, Text } = Typography;

interface QuestionCountSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export const QuestionCountSlider: React.FC<QuestionCountSliderProps> = ({
  value,
  max,
  onChange,
}) => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontFamily: "monospace", fontWeight: 700 }}>
            Number of Questions
          </Title>
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            How many questions would you like?
          </Text>
        </div>
        <InputNumber
          min={1}
          max={max}
          value={value}
          onChange={(val) => onChange(val ?? 1)}
          size="large"
          style={{ width: 100, fontSize: 20, fontFamily: "monospace" }}
        />
      </div>
      <Slider
        min={1}
        max={max}
        value={value}
        onChange={onChange}
        marks={{ 1: "1", 10: "10", 20: "20" }}
      />
    </div>
  );
};
