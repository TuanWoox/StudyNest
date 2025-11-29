import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Grid } from "antd";
import {
  EyeOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useQuizTimeLimit } from "@/hooks/quizAttempt/useQuizTimeLimit";

const { useBreakpoint } = Grid;

interface QuizCardActionsProps {
  quizId: string;
}

const QuizCardActions: React.FC<QuizCardActionsProps> = ({ quizId }) => {
  const { openTimeLimitModal, TimeLimitModal } = useQuizTimeLimit({ quizId: quizId });
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const onTakeQuiz = () => {
    openTimeLimitModal(() => {
      navigate(`/user/quiz/quizAttempt/${quizId}`, {
        state: {
          from: "/user/quiz"
        }
      });
    });
  };


  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "stretch",
        flexWrap: "wrap",
      }}
    >

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
        onClick={onTakeQuiz}
      >
        {!screens.xs && "Take Quiz"}
      </Button>
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
    </div>
  );
};

export default QuizCardActions;
