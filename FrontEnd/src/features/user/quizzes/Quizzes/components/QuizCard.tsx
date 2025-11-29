import React from "react";
import { Card, theme, Grid } from "antd";
import { QuizList } from "@/types/quiz/quiz";
import { formatDMY } from "@/utils/date";
import QuizCardHeader from "./QuizCardHeader";
import QuizCardInfo from "./QuizCardInfo";
import QuizCardActions from "./QuizCardActions";

const { useToken } = theme;
const { useBreakpoint } = Grid;

interface QuizCardProps {
  quiz: QuizList;
  index: number;
  page: number;
  pageSize: number;
  onDelete: (quizId: string) => void;
  deletingId: string | null;
  isDeleting: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onDelete,
  deletingId,
  isDeleting,
}) => {
  const { token } = useToken();
  const screens = useBreakpoint();

  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  return (
    <Card
      hoverable
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) {
          return;
        }
      }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        border: borderColor,
        borderRadius: 0,
        boxShadow: shadowColor,
        backgroundColor: token.colorBgContainer,
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: screens.md ? "20px" : "16px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `6px 6px 0px ${token.colorPrimary}55`;
        e.currentTarget.style.transform = "translate(-2px, -4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowColor;
        e.currentTarget.style.transform = "translate(0, 0)";
      }}
    >
      <QuizCardHeader 
        title={quiz.title} 
        noteTitle={quiz.noteTitle}
        onDelete={() => onDelete(quiz.id)}
        isDeleting={deletingId === quiz.id && isDeleting}
      />

      <QuizCardInfo
        totalQuestions={quiz.totalQuestion}
        dateCreated={formatDMY(quiz.dateCreated)}
        difficulty={quiz.difficulty}
      />

      <div
        style={{
          paddingTop: 16,
          borderTop: `1px solid ${token.colorPrimary}88`,
        }}
      >
        <QuizCardActions quizId={quiz.id} />
      </div>
    </Card>
  );
};

export default QuizCard;
