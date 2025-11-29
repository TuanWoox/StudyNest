import React from "react";
import { Card, Space, Tag, Typography, theme } from "antd";
import { formatDMY } from "@/utils/date";

const { Text } = Typography;
const { useToken } = theme;

interface QuizMetadataCardProps {
  questionCount: number;
  dateCreated?: string;
  difficulty?: string;
}

export const QuizMetadataCard: React.FC<QuizMetadataCardProps> = ({
  questionCount,
  dateCreated,
  difficulty,
}) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Theme constants
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;
  
  const getDifficultyColor = (diff?: string) => {
    if (!diff) return token.colorPrimary;
    switch (diff.toLowerCase()) {
      case 'easy':
        return token.colorSuccess;
      case 'medium':
        return token.colorWarning;
      case 'hard':
        return token.colorError;
      default:
        return token.colorPrimary;
    }
  };

  return (
    <Card
      style={{
        marginTop: isMobile ? token.marginSM : token.margin,
        border: borderColor,
        borderRadius: 0,
        boxShadow: shadowColor,
        backgroundColor: token.colorBgContainer,
      }}
      bodyStyle={{
        padding: isMobile ? token.paddingSM : token.padding,
      }}
    >
      <Space 
        size="middle" 
        wrap
        style={{ 
          width: "100%",
          justifyContent: isMobile ? "flex-start" : "space-between"
        }}
      >
        {difficulty && (
          <Tag
            style={{
              fontSize: isMobile ? 13 : 14,
              padding: isMobile ? "4px 10px" : "5px 12px",
              borderRadius: 0,
              fontWeight: 500,
              fontFamily: "monospace",
              textTransform: "capitalize",
              backgroundColor: `${getDifficultyColor(difficulty)}15`,
              border: `1px solid ${getDifficultyColor(difficulty)}`,
              color: getDifficultyColor(difficulty),
            }}
          >
            {difficulty}
          </Tag>
        )}
        
        <Tag
          color="blue"
          style={{
            fontSize: isMobile ? 13 : 14,
            padding: isMobile ? "4px 10px" : "5px 12px",
            borderRadius: 0,
            fontWeight: 500,
            fontFamily: "monospace",
          }}
        >
          {questionCount} Question{questionCount !== 1 ? "s" : ""}
        </Tag>

        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? 12 : 14,
            fontFamily: "monospace",
          }}
        >
          Created {dateCreated && formatDMY(dateCreated)}
        </Text>
      </Space>
    </Card>
  );
};
