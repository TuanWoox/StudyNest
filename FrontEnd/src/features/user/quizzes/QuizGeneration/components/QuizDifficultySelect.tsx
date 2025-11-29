import React from "react";
import { Radio, Space, Card, Typography, theme, Tooltip } from "antd";
import { BulbOutlined, InfoCircleOutlined } from "@ant-design/icons";
import SettingsSection from "./SettingsSection";

const { Text } = Typography;
const { useToken } = theme;

interface DifficultyOption {
  value: string;
  label: string;
  desc: string;
  tooltip: React.ReactNode;
  color: string;
}

interface QuizDifficultySelectProps {
  value: string;
  options: DifficultyOption[];
  onChange: (value: string) => void;
}

export const QuizDifficultySelect: React.FC<QuizDifficultySelectProps> = ({
  value,
  options,
  onChange,
}) => {
  const { token } = useToken();

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <SettingsSection icon={<BulbOutlined />} title="Difficulty Level">
      <Radio.Group value={value} style={{ width: "100%" }} onChange={(e) => onChange(e.target.value)}>
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {options.map((opt) => (
            <Card
              key={opt.value}
              size="small"
              hoverable
              style={{
                cursor: "pointer",
                borderRadius: 0,
                border:
                  value === opt.value
                    ? borderColor
                    : `1px solid ${token.colorBorder}`,
                boxShadow: value === opt.value ? shadowColor : "none",
              }}
              onClick={() => onChange(opt.value)}
            >
              <Radio value={opt.value} style={{ width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Text strong style={{ fontFamily: "monospace", color: opt.color }}>
                      {opt.label}
                    </Text>
                    <Tooltip 
                      title={
                        <div style={{ 
                          padding: "8px 4px",
                          fontFamily: "monospace",
                          fontSize: 13,
                          lineHeight: 1.6
                        }}>
                          {opt.tooltip}
                        </div>
                      }
                      placement="right"
                      overlayStyle={{ 
                        maxWidth: 350,
                      }}
                      overlayInnerStyle={{
                        borderRadius: 0,
                        padding: 0,
                        backgroundColor: token.colorBgElevated,
                        border: `1px solid ${token.colorBorder}`,
                        boxShadow: `2px 2px 0px ${token.colorPrimary}33`,
                      }}
                    >
                      <InfoCircleOutlined 
                        style={{ 
                          color: token.colorPrimary,
                          fontSize: 14,
                          cursor: "help",
                          transition: "all 0.2s"
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = token.colorPrimaryHover;
                          e.currentTarget.style.transform = "scale(1.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = token.colorPrimary;
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </Tooltip>
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, fontFamily: "monospace" }}
                    >
                      {opt.desc}
                    </Text>
                  </div>
                </div>
              </Radio>
            </Card>
          ))}
        </Space>
      </Radio.Group>
    </SettingsSection>
  );
};
