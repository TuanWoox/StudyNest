import React from "react";
import { List, Space, Typography, theme } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import type { Choice } from "@/types/quiz/quiz";

const { Text } = Typography;
const { useToken } = theme;

interface ChoiceListProps {
  type: "MCQ" | "MSQ" | "TF";
  choices: Choice[];
}

export const ChoiceList: React.FC<ChoiceListProps> = ({ type, choices }) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  const getChoiceStyles = (isCorrect: boolean) => {
    // Use consistent success colors for all correct answers regardless of type
    return {
      backgroundColor: isCorrect ? token.colorSuccessBg : token.colorFillAlter,
      borderLeft: isCorrect
        ? `4px solid ${token.colorSuccess}`
        : `4px solid ${token.colorFillSecondary}`,
      iconColor: token.colorSuccess,
      hoverBg: isCorrect ? token.colorSuccessBgHover : token.colorFillTertiary,
    };
  };

  return (
    <div>
      <List
        size="small"
        bordered={false}
        dataSource={choices}
        style={{
          borderRadius: 0,
          overflow: "hidden",
          paddingRight: "4px",
          paddingBottom: "4px",
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
                marginBottom:
                  index < choices.length - 1 ? (isMobile ? 8 : 10) : 0,
                borderRadius: 0,
                border: isCorrect
                  ? `2px solid ${token.colorSuccess}`
                  : `1px solid ${token.colorBorder}`,
                boxShadow: isCorrect
                  ? `4px 4px 0px ${token.colorSuccess}55`
                  : "none",
                cursor: "default",
                transition: "all 0.2s ease",
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
                      border: `2px solid ${token.colorTextTertiary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: isMobile ? 10 : 11,
                      color: token.colorTextTertiary,
                      fontWeight: 600,
                      marginTop: 2,
                      background: token.colorBgContainer,
                      fontFamily: "monospace",
                      opacity: 0.7,
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
                    color: isCorrect
                      ? token.colorText
                      : token.colorTextSecondary,
                    fontFamily: "monospace",
                  }}
                >
                  {choice.text}
                </Text>
              </Space>
            </List.Item>
          );
        }}
      />
    </div>
  );
};
