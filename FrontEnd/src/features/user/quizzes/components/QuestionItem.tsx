import React, { useEffect } from "react";
import {
  Flex,
  Space,
  Badge,
  Typography,
  Tag,
  Card,
  Divider,
  theme,
} from "antd";
import { QuestionCircleOutlined, CheckCircleFilled } from "@ant-design/icons";
import type { Question } from "@/types/quiz/quiz";
import { QuestionActions } from "./QuestionActions";
import { ChoiceList } from "./ChoiceList";

const { useToken } = theme;
const { Text, Paragraph } = Typography;

interface QuestionItemProps {
  question: Question;
  index: number;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  isDeleting: boolean;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const { token } = useToken();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const getQuestionTypeInfo = (type: string) => {
    switch (type) {
      case "MCQ":
        return {
          color: "blue",
          label: "Multiple Choice",
        };
      case "MSQ":
        return {
          color: "purple",
          label: "Multi-Select",
        };
      case "TF":
        return {
          color: "green",
          label: "True/False",
        };
      default:
        return {
          color: "default",
          label: type,
        };
    }
  };

  const typeInfo = getQuestionTypeInfo(question.type);

  return (
    <Card
      style={{
        marginBottom: isMobile ? token.marginSM : token.marginLG,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
      }}
      bodyStyle={{
        padding: isMobile ? token.padding : token.paddingLG,
      }}
    >
      {/* Question Header */}
      <Flex
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap={isMobile ? token.marginXS : token.marginSM}
      >
        <Flex
          align="flex-start"
          gap={isMobile ? token.marginXS : token.marginSM}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Badge
            count={index + 1}
            style={{
              backgroundColor: token.colorPrimary,
              fontSize: isMobile ? 13 : 15,
              fontWeight: 600,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{
                fontSize: isMobile ? 15 : 17,
                display: "block",
                marginBottom: isMobile ? token.marginXS : token.marginSM,
                lineHeight: 1.5,
                wordBreak: "break-word",
                fontWeight: 600,
              }}
            >
              {question.name}
            </Text>
            <Space size={isMobile ? token.marginXXS : token.marginXS} wrap>
              <Tag
                color={typeInfo.color}
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? 12 : 13,
                }}
              >
                {typeInfo.label}
              </Tag>
              <Tag>{question.choices?.length || 0} choices</Tag>
            </Space>
          </div>
        </Flex>

        <QuestionActions
          questionId={question.id}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </Flex>

      {/* Divider */}
      <Divider
        style={{
          margin: isMobile ? `${token.margin}px 0` : `${token.marginLG}px 0`,
        }}
      />

      {/* Choices */}
      <div
        style={{
          marginBottom: question.explanation
            ? isMobile
              ? token.margin
              : token.marginLG
            : 0,
        }}
      >
        <ChoiceList type={question.type} choices={question.choices || []} />
      </div>

      {/* Explanation */}
      {question.explanation && (
        <Card
          size="small"
          style={{
            marginTop: 0,
            backgroundColor: token.colorInfoBg,
            borderLeft: `3px solid ${token.colorInfo}`,
            borderRadius: token.borderRadius,
          }}
          bodyStyle={{
            padding: isMobile ? token.paddingSM : token.padding,
          }}
        >
          <Space
            direction="vertical"
            size={isMobile ? token.marginXXS : token.marginXS}
            style={{ width: "100%" }}
          >
            <Space size={token.marginXS}>
              <CheckCircleFilled
                style={{
                  color: token.colorInfo,
                  fontSize: isMobile ? 15 : 17,
                }}
              />
              <Text
                strong
                style={{
                  color: token.colorInfo,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                }}
              >
                Explanation
              </Text>
            </Space>
            <Paragraph
              style={{
                margin: 0,
                lineHeight: 1.7,
                fontSize: isMobile ? 13 : 14,
                color: token.colorTextSecondary,
              }}
            >
              {question.explanation}
            </Paragraph>
          </Space>
        </Card>
      )}
    </Card>
  );
};
