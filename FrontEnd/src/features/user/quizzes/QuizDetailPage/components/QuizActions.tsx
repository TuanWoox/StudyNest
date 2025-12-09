import React from "react";
import { Space, Button, Dropdown, MenuProps } from "antd";
import { FormOutlined, ArrowLeftOutlined, DownOutlined, PlayCircleOutlined, TeamOutlined } from "@ant-design/icons";

interface QuizActionsProps {
  onTakeQuiz: () => void;
  onCreateSession: () => void;
  onBack: () => void;
}

export const QuizActions: React.FC<QuizActionsProps> = ({
  onTakeQuiz,
  onCreateSession,
  onBack,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const menuItems: MenuProps['items'] = [
    {
      key: 'take-quiz',
      label: 'Take Quiz',
      icon: <PlayCircleOutlined />,
      onClick: onTakeQuiz,
    },
    {
      key: 'create-session',
      label: 'Create Session',
      icon: <TeamOutlined />,
      onClick: onCreateSession,
    },
  ];

  return (
    <Space wrap>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button
          type="primary"
          icon={<FormOutlined />}
          size={isMobile ? "middle" : "large"}
          style={{
            whiteSpace: "nowrap",
            fontFamily: "monospace",
            fontWeight: 600,
            borderRadius: 0,
          }}
        >
          {!isMobile && "Take Quiz"} <DownOutlined />
        </Button>
      </Dropdown>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        size={isMobile ? "middle" : "large"}
        style={{
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontWeight: 600,
          borderRadius: 0,
        }}
      >
        {!isMobile && "Back"}
      </Button>
    </Space>
  );
};
