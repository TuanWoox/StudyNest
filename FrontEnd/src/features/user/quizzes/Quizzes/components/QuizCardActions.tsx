import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Grid, Dropdown, MenuProps } from "antd";
import {
  EyeOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  DownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuizTimeLimit } from "@/hooks/quizAttempt/useQuizTimeLimit";
import CreateQuizSessionModal, { CreateQuizSessionModalRef } from "@/features/user/quizzes/QuizDetailPage/components/CreateQuizSessionModal";

const { useBreakpoint } = Grid;

interface QuizCardActionsProps {
  quizId: string;
}

const QuizCardActions: React.FC<QuizCardActionsProps> = ({ quizId }) => {
  const { openTimeLimitModal, TimeLimitModal } = useQuizTimeLimit({ quizId: quizId });
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const createSessionModalRef = useRef<CreateQuizSessionModalRef>(null);

  const onTakeQuiz = () => {
    openTimeLimitModal(() => {
      navigate(`/user/quiz/quizAttempt/${quizId}`, {
        state: {
          from: "/user/quiz"
        }
      });
    });
  };

  const onCreateSession = () => {
    createSessionModalRef.current?.open(quizId);
  };

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
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "stretch",
        flexWrap: "wrap",
      }}
    >
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          block
          size="middle"
          style={{
            borderRadius: 0,
            fontFamily: "monospace",
            fontWeight: 600,
            flex: 1
          }}
        >
          {!screens.xs && "Take Quiz"} <DownOutlined />
        </Button>
      </Dropdown>
      <Link to={`/user/quiz/${quizId}`} style={{ flex: 1 }}>
        <Button
          icon={<EyeOutlined />}
          block
          size="middle"
          style={{
            borderRadius: 0,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {!screens.xs && "Details"}
        </Button>
      </Link>
      <Link to={`/user/quiz/history/${quizId}`} style={{ flex: 1 }}>
        <Button
          icon={<HistoryOutlined />}
          block
          size="middle"
          style={{
            borderRadius: 0,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          {!screens.xs && "History"}
        </Button>
      </Link>

      {TimeLimitModal}
      <CreateQuizSessionModal ref={createSessionModalRef} />
    </div>
  );
};

export default QuizCardActions;
