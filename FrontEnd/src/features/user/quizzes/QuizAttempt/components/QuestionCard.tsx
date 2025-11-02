import Spinner from "@/components/Spinner/Spinner";
import MultipleChoiceQuestion from "./QuestionType/MultipleChoiceQuestion";
import MultipleSelectQuestion from "./QuestionType/MultipleSelectQuestion";
import TrueFalseQuestion from "./QuestionType/TrueFalseQuestion";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectQuizCard } from "@/store/quizAttemptSlice";
import { Card, theme } from "antd";
import React from "react";

const QuestionCard: React.FC = () => {
    const { token } = theme.useToken();
    const { currentQuestion: question, currentAnswer: answer } = useReduxSelector(selectQuizCard);

    if (!question) return <Spinner />;

    // 🎨 Tông màu LearnHub Retro
    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88% opacity
    const shadowColor = `${primaryColor}55`; // 33% opacity

    return (
        <Card
            style={{
                fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                border: `1.5px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                transition: "all 0.25s ease",
                marginBottom: "16px",
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    {/* Badge */}
                    <div className="flex items-center gap-3 mb-2">
                        <QuestionTypeBadge type={question.type.toLowerCase()} />
                    </div>

                    {/* Question Title */}
                    <h2
                        className="text-balance"
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontWeight: 700,
                            fontSize: "1.3rem",
                            lineHeight: 1.4,
                            marginBottom: "8px",
                        }}
                    >
                        {question.name}
                    </h2>
                </div>
            </div>

            {/* Render Question Types */}
            {question.type.toLowerCase() === "mcq" && (
                <MultipleChoiceQuestion question={question} answer={answer} />
            )}
            {question.type.toLowerCase() === "msq" && (
                <MultipleSelectQuestion question={question} answer={answer} />
            )}
            {question.type.toLowerCase() === "tf" && (
                <TrueFalseQuestion question={question} answer={answer} />
            )}
        </Card>
    );
};

export default QuestionCard;
