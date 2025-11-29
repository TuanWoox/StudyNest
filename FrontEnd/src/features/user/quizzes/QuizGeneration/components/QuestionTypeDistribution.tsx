import React from "react";
import { Row, Col, Typography } from "antd";
import QuestionTypeCard from "./QuestionTypeCard";

const { Title, Text } = Typography;

interface QuestionTypeConfig {
  key: string;
  title: string;
  color: string;
  bg: string;
  border: string;
}

interface QuestionTypeDistributionProps {
  configs: QuestionTypeConfig[];
  counts: Record<string, number>;
  distribution: Record<string, number>;
  totalQuestions: number;
  onChange: (type: string, value: number) => void;
}

export const QuestionTypeDistribution: React.FC<QuestionTypeDistributionProps> = ({
  configs,
  counts,
  distribution,
  totalQuestions,
  onChange,
}) => {
  return (
    <div>
      <Title level={4} style={{ fontFamily: "monospace", fontWeight: 700 }}>
        Question Types
      </Title>
      <Text
        type="secondary"
        style={{
          display: "block",
          marginBottom: 16,
          fontFamily: "monospace",
        }}
      >
        Adjust the mix of question formats
      </Text>
      <Row gutter={[16, 16]}>
        {configs.map((config) => (
          <Col span={24} md={8} key={config.key}>
            <QuestionTypeCard
              config={config}
              count={counts[config.key]}
              percentage={distribution[config.key]}
              max={totalQuestions}
              onChange={(val) => onChange(config.key, val)}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};
