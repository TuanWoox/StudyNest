import { useState, useEffect } from "react";
import { QuestionDTO } from "@/types/question/questionDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";
import { Row, Col, Pagination } from "antd";
import { useOutletContext } from "react-router-dom";
import QuestionResultCard from "./QuestionResultCard";

interface QuestionResultsListProps {
    questions: QuestionDTO[] | undefined;
    answers: QuizAttemptAnswerDTO[] | undefined;
}

const QuestionResultsList = ({ questions, answers }: QuestionResultsListProps) => {
    const darkMode = useOutletContext<boolean>();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;

    useEffect(() => {
        setCurrentPage(1);
    }, [questions]);

    if (!questions || !answers) {
        return (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                No results to display
            </div>
        );
    }

    const getAnswerForQuestion = (questionId: string) =>
        answers.find(answer => answer.snapshotQuestionId === questionId);

    const totalQuestions = questions.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedQuestions = questions.slice(startIndex, endIndex);

    return (
        <div className="mt-3">
            <Row gutter={[16, 16]}>
                {paginatedQuestions.map((question, idx) => {
                    const answer = getAnswerForQuestion(question.id);
                    if (!answer) return null;

                    return (
                        <Col xs={24} lg={12} key={question.id}>
                            <QuestionResultCard
                                question={question}
                                answer={answer}
                                index={startIndex + idx + 1}
                                darkMode={darkMode}
                            />
                        </Col>
                    );
                })}
            </Row>

            {totalQuestions > pageSize && (
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalQuestions}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    style={{ marginTop: 12, textAlign: 'left' }}
                    align="end"
                />
            )}
        </div>
    );
};

export default QuestionResultsList;
