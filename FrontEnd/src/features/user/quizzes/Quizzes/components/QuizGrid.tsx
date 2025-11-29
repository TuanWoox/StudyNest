import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Skeleton, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { QuizList } from "@/types/quiz/quiz";
import QuizCard from "./QuizCard";

const { useToken } = theme;

interface QuizGridProps {
  quizzes: QuizList[];
  isPending: boolean;
  pageSize: number;
  page: number;
  onDelete: (quizId: string) => void;
  deletingId: string | null;
  isDeleting: boolean;
}

const QuizGrid: React.FC<QuizGridProps> = ({
  quizzes,
  isPending,
  pageSize,
  page,
  onDelete,
  deletingId,
  isDeleting,
}) => {
  const { token } = useToken();
  const borderColor = `2px solid ${token.colorPrimary}E0`;
  const shadowColor = `4px 4px 0px ${token.colorPrimary}55`;

  // Loading state
  if (isPending) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
        {[...Array(pageSize)].map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card
              style={{
                border: borderColor,
                borderRadius: 0,
                boxShadow: shadowColor,
                backgroundColor: token.colorBgContainer,
              }}
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  // Empty state
  if (!quizzes || quizzes.length === 0) {
    return (
      <Link to="/user/quiz/generate">
        <EmptyState
          type="empty"
          title="No Quizzes Yet"
          description="You haven't created any quizzes yet. Start by creating your first quiz from your notes!"
          actionLabel="Create Your First Quiz"
          actionIcon={<PlusOutlined />}
          onAction={() => { }}
        />
      </Link>
    );
  }

  // Quiz grid
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
      {quizzes.map((quiz, index) => (
        <Col key={quiz.id} xs={24} sm={12} md={8}>
          <QuizCard
            quiz={quiz}
            index={index}
            page={page}
            pageSize={pageSize}
            onDelete={onDelete}
            deletingId={deletingId}
            isDeleting={isDeleting}
          />
        </Col>
      ))}
    </Row>
  );
};

export default QuizGrid;
