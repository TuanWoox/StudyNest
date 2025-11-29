import React from "react";
import { Button, Flex, theme } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { useToken } = theme;

interface QuizGenerationActionsProps {
  current: number;
  totalSteps: number;
  isLoading: boolean;
  isMobile: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGenerate: () => void;
}

export const QuizGenerationActions: React.FC<QuizGenerationActionsProps> = ({
  current,
  totalSteps,
  isLoading,
  isMobile,
  onPrev,
  onNext,
  onGenerate,
}) => {
  const { token } = useToken();

  return (
    <Flex
      justify="flex-end"
      style={{
        borderTop: `1px solid ${token.colorBorder}`,
        padding: isMobile ? 16 : 24,
        position: "sticky",
        bottom: 0,
        backgroundColor: token.colorBgContainer,
        zIndex: 9,
      }}
    >
      <div>
        {current > 0 && (
          <Button
            style={{
              marginRight: 12,
              borderRadius: 0,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
            onClick={onPrev}
            disabled={isLoading}
            size="large"
          >
            Previous
          </Button>
        )}
        {current < totalSteps - 1 && (
          <Button
            type="primary"
            onClick={onNext}
            disabled={isLoading}
            size="large"
            style={{
              minWidth: 100,
              borderRadius: 0,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            Next
          </Button>
        )}
        {current === totalSteps - 1 && (
          <Button
            type="primary"
            onClick={onGenerate}
            loading={isLoading}
            icon={isLoading ? <LoadingOutlined /> : undefined}
            size="large"
            style={{
              minWidth: 160,
              borderRadius: 0,
              fontFamily: "monospace",
              fontWeight: 600,
            }}
          >
            {isLoading ? "Generating Quiz..." : "Generate Quiz"}
          </Button>
        )}
      </div>
    </Flex>
  );
};
