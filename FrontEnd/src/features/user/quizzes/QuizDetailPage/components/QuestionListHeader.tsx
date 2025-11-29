import React from "react";
import { Flex, Space, Button, Typography, theme } from "antd";
import { PlusOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useToken } = theme;

interface QuestionListHeaderProps {
  questionCount: number;
  isAllExpanded: boolean;
  onToggleAll: () => void;
  onAddQuestion: () => void;
}

export const QuestionListHeader: React.FC<QuestionListHeaderProps> = ({
  questionCount,
  isAllExpanded,
  onToggleAll,
  onAddQuestion,
}) => {
  const { token } = useToken();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{
        marginBottom: token.marginLG,
      }}
      wrap="wrap"
      gap={token.margin}
    >
      <Space direction="vertical" size={token.marginXXS}>
        <Title
          level={4}
          style={{ margin: 0, fontFamily: "monospace", fontWeight: 700 }}
        >
          Questions
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: isMobile ? 12 : 14, fontFamily: "monospace" }}
        >
          {questionCount === 0
            ? "No questions yet"
            : `${questionCount} question${questionCount > 1 ? "s" : ""}`}
        </Text>
      </Space>
      <Space wrap>
        {questionCount > 0 && (
          <Button
            icon={isAllExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={onToggleAll}
            style={{
              borderRadius: 0,
              height: isMobile ? 36 : 44,
              paddingLeft: isMobile ? token.padding : token.paddingLG,
              paddingRight: isMobile ? token.padding : token.paddingLG,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
            size={isMobile ? "middle" : "large"}
          >
            {isAllExpanded ? "Collapse All" : "Expand All"}
          </Button>
        )}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddQuestion}
          size={isMobile ? "middle" : "large"}
          style={{
            borderRadius: 0,
            height: isMobile ? 36 : 44,
            paddingLeft: isMobile ? token.padding : token.paddingLG,
            paddingRight: isMobile ? token.padding : token.paddingLG,
            fontWeight: 600,
            fontFamily: "monospace",
          }}
        >
          {isMobile ? "Add" : "Add Question"}
        </Button>
      </Space>
    </Flex>
  );
};
