import React from "react";
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
import { CheckCircleFilled } from "@ant-design/icons";
import type { Question } from "@/types/quiz/quiz";
import { QuestionActions } from "./QuestionActions";
import { ChoiceList } from "./ChoiceList";

const { useToken } = theme;
const { Text, Paragraph } = Typography;

interface QuestionItemProps {
  question?: Question;
  index?: number;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  isDeleting?: boolean;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index = 0,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { token } = useToken();

  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const getQuestionTypeInfo = (type?: string) => {
    switch (type) {
      case "MCQ":
        return { color: token.colorInfo, bgColor: token.colorInfoBg, label: "Multiple Choice" };
      case "MSQ":
        return { color: token.colorPrimary, bgColor: token.colorPrimaryBg, label: "Multi-Select" };
      case "TF":
        return { color: token.colorSuccess, bgColor: token.colorSuccessBg, label: "True/False" };
      default:
        return {
          color: token.colorTextSecondary,
          bgColor: token.colorFillSecondary,
          label: type ?? "Unknown",
        };
    }
  };

  const typeInfo = getQuestionTypeInfo(question?.type);

  return (
    <Card style={{ border: "none" }} bodyStyle={{ padding: "12px" }}>
      {/* Header */}
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
            count={(index ?? 0) + 1}
            style={{
              backgroundColor: token.colorPrimary,
              fontSize: isMobile ? 13 : 15,
              fontWeight: 600,
              fontFamily: "monospace",
              color: token.colorWhite,
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
                fontFamily: "monospace",
              }}
            >
              {question?.name ?? "Untitled Question"}
            </Text>

            <Space size={isMobile ? token.marginXXS : token.marginXS} wrap>
              <Tag
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? 12 : 13,
                  fontFamily: "monospace",
                  borderRadius: 0,
                  color: typeInfo.color,
                  backgroundColor: typeInfo.bgColor,
                  border: `1px solid ${typeInfo.color}`,
                }}
              >
                {typeInfo.label}
              </Tag>

              <Tag
                style={{
                  fontFamily: "monospace",
                  borderRadius: 0,
                  color: token.colorTextSecondary,
                  backgroundColor: token.colorFillSecondary,
                  border: `1px solid ${token.colorBorder}`,
                }}
              >
                {question?.choices?.length ?? 0} choices
              </Tag>
            </Space>
          </div>
        </Flex>

        {/* Render actions only if handlers exist */}
        {onEdit && onDelete ? (
          <QuestionActions
            questionId={question?.id ?? ""}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ) : null}
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
          marginBottom: question?.explanation
            ? isMobile
              ? token.margin
              : token.marginLG
            : 0,
        }}
      >
        <ChoiceList
          type={question?.type ?? "MCQ"}
          choices={question?.choices ?? []}
        />
      </div>

      {/* Explanation */}
      {question?.explanation && (
        <Card
          size="small"
          style={{
            marginTop: 0,
            backgroundColor: token.colorInfoBg,
            border: borderColor,
            borderLeft: `3px solid ${token.colorInfo}`,
            borderRadius: 0,
            boxShadow: shadowColor,
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
                  fontFamily: "monospace",
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
                fontFamily: "monospace",
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
