import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer, removeAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Checkbox, Space, theme } from "antd";
import { useEffect, useState } from "react";

interface MultipleSelectQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const MultipleSelectQuestion = ({
    question,
    answer,
}: MultipleSelectQuestionPropType) => {
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const dispatch = useReduxDispatch();
    const { token } = theme.useToken();

    const onAnswerChange = (checkedValues: string[]) => {
        setSelectedAnswers(checkedValues);
        if (checkedValues.length > 0) {
            const newAnswer: CreateQuizAttemptAnswerDTO = {
                snapShotQuestionId: question.id,
                QuizAttemptAnswerChoices: checkedValues.map((choiceId) => ({
                    choiceId,
                })),
            };
            dispatch(addAnswer(newAnswer));
        } else {
            dispatch(removeAnswer(question.id));
        }
    };

    useEffect(() => {
        if (answer) {
            const choiceIds = answer.QuizAttemptAnswerChoices.map(
                (choice) => choice.choiceId
            );
            setSelectedAnswers(choiceIds);
        }
    }, [answer]);

    return (
        <Checkbox.Group
            onChange={(checkedValues) => onAnswerChange(checkedValues as string[])}
            value={selectedAnswers}
            className="w-full"
        >
            <Space direction="vertical" className="w-full" size="middle">
                {question.choices.map((option) => {
                    const isSelected = selectedAnswers.includes(option.id);
                    return (
                        <Checkbox
                            key={option.id}
                            value={option.id}
                            className="w-full transition-all duration-200"
                            style={{
                                margin: 0,
                                border: `1.5px solid ${isSelected
                                    ? token.colorPrimary
                                    : `${token.colorPrimary}E0` // 88% opacity border
                                    }`,
                                boxShadow: `3px 3px 0 ${token.colorPrimary}55`, // 33% opacity shadow
                                fontFamily: `"Courier New", "IBM Plex Mono", monospace`,
                                fontWeight: 600,
                                padding: "6px",
                                cursor: "pointer",
                                transform: "translateY(0)",
                                transition: "all 0.2s ease-in-out",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = token.colorPrimary;
                                e.currentTarget.style.boxShadow = `4px 4px 0 ${token.colorPrimary}66`;
                                e.currentTarget.style.transform = "translateY(-3px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = isSelected
                                    ? token.colorPrimary
                                    : `${token.colorPrimary}E0`;
                                e.currentTarget.style.boxShadow = `3px 3px 0 ${token.colorPrimary}55`;
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <div
                                className="flex-1 text-base sm:text-lg md:text-xl"
                                style={{
                                    padding: "0.5rem 0",
                                    letterSpacing: "0.3px",
                                }}
                            >
                                {option.text}
                            </div>
                        </Checkbox>
                    );
                })}
            </Space>
        </Checkbox.Group>
    );
};

export default MultipleSelectQuestion;
