import React from "react";
import { Steps } from "antd";
import {
  FileOutlined,
  SettingOutlined,
  EyeOutlined,
} from "@ant-design/icons";

interface StepConfig {
  title: string;
  icon: React.ReactNode;
}

interface QuizGenerationStepsNavProps {
  current: number;
  isLoading: boolean;
}

const STEPS: StepConfig[] = [
  { title: "Source", icon: <FileOutlined /> },
  { title: "Options", icon: <SettingOutlined /> },
  { title: "Review", icon: <EyeOutlined /> },
];

export const QuizGenerationStepsNav: React.FC<QuizGenerationStepsNavProps> = ({
  current,
  isLoading,
}) => {
  return (
    <Steps
      current={current}
      responsive={false}
      size="small"
      type="navigation"
      className="custom-steps"
    >
      {STEPS.map((step, index) => (
        <Steps.Step
          key={step.title}
          title={step.title}
          icon={step.icon}
          status={
            current === index ? "process" : current > index ? "finish" : "wait"
          }
          disabled={isLoading}
        />
      ))}
    </Steps>
  );
};
