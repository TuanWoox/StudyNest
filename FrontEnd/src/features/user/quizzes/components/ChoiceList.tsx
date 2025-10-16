import React from "react";
import { List, Space, Typography } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import type { Choice } from "@/types/quiz/quiz";

const { Text } = Typography;

interface ChoiceListProps {
  type: "MCQ" | "MSQ" | "TF";
  choices: Choice[];
}

export const ChoiceList: React.FC<ChoiceListProps> = ({ type, choices }) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const getChoiceStyles = (isCorrect: boolean) => {
    if (type === "MCQ" || type === "TF") {
      return {
        backgroundColor: isCorrect ? "#f6ffed" : "#fafafa",
        borderLeft: isCorrect ? "4px solid #52c41a" : "4px solid #f0f0f0",
        iconColor: "#52c41a",
        hoverBg: isCorrect ? "#e6f7e0" : "#f5f5f5",
      };
    } else {
      // MSQ
      return {
        backgroundColor: isCorrect ? "#f0f5ff" : "#fafafa",
        borderLeft: isCorrect ? "4px solid #722ed1" : "4px solid #f0f0f0",
        iconColor: "#722ed1",
        hoverBg: isCorrect ? "#e6f0ff" : "#f5f5f5",
      };
    }
  };

  return (
    <div>
      <List
        size="small"
        bordered={false}
        dataSource={choices}
        style={{
          borderRadius: isMobile ? 8 : 10,
          overflow: "hidden",
        }}
        renderItem={(choice, index) => {
          const isCorrect = choice.isCorrect;
          const styles = getChoiceStyles(isCorrect);
          const alphabetLabel = String.fromCharCode(65 + index); // A, B, C, D...

          return (
            <List.Item
              style={{
                backgroundColor: styles.backgroundColor,
                borderLeft: styles.borderLeft,
                padding: isMobile ? "12px 14px" : "16px 18px",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                marginBottom:
                  index < choices.length - 1 ? (isMobile ? 8 : 10) : 0,
                borderRadius: isMobile ? 8 : 10,
                border: `1px solid ${
                  isCorrect
                    ? type === "MSQ"
                      ? "#d6e4ff"
                      : "#d9f7be"
                    : "#f0f0f0"
                }`,
                boxShadow: isCorrect
                  ? `0 2px 8px ${styles.iconColor}15`
                  : "0 1px 4px rgba(0,0,0,0.04)",
                cursor: "default",
              }}
              className="choice-item"
            >
              <Space
                align="start"
                size={isMobile ? 10 : 12}
                style={{ width: "100%" }}
              >
                {isCorrect ? (
                  <CheckCircleFilled
                    style={{
                      color: styles.iconColor,
                      fontSize: isMobile ? 18 : 20,
                      marginTop: 2,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: isMobile ? 18 : 20,
                      height: isMobile ? 18 : 20,
                      borderRadius: "50%",
                      border: "2px solid #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? 10 : 11,
                      color: "#8c8c8c",
                      fontWeight: 600,
                      marginTop: 2,
                      background: "#fff",
                    }}
                  >
                    {alphabetLabel}
                  </div>
                )}
                <Text
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: isCorrect ? 500 : 400,
                    lineHeight: 1.7,
                    flex: 1,
                    color: isCorrect ? "#262626" : "#595959",
                  }}
                >
                  {choice.text}
                </Text>
              </Space>
            </List.Item>
          );
        }}
      />

      <style>
        {`
          .choice-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          }
        `}
      </style>
    </div>
  );
};
