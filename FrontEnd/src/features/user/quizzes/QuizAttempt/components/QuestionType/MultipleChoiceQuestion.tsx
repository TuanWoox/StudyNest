import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Radio, Space, theme } from "antd";
import { useEffect, useState } from "react";

interface MultipleChoiceQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const MultipleChoiceQuestion = ({
    question,
    answer,
}: MultipleChoiceQuestionPropType) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
        undefined
    );
    const dispatch = useReduxDispatch();
    const { token } = theme.useToken();

    const onAnswerChange = (value: string) => {
        setSelectedAnswer(value);
        const newAnswer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: [{ choiceId: value }],
        };
        dispatch(addAnswer(newAnswer));
    };

    useEffect(() => {
        if (answer) {
            const choiceId = answer.QuizAttemptAnswerChoices.at(0)?.choiceId ?? undefined;
            setSelectedAnswer(choiceId);
        }
    }, [answer]);

    return (
        <Radio.Group
            onChange={(e) => onAnswerChange(e.target.value)}
            value={selectedAnswer as string}
            className="w-full"
        >
            <Space direction="vertical" className="w-full" size="middle">
                {question.choices.map((option) => {
                    const isSelected = selectedAnswer === option.id;
                    return (
                        <Radio
                            key={option.id}
                            value={option.id}
                            className="w-full transition-all duration-200"
                            style={{
                                margin: 0,
                                border: `1.5px solid ${isSelected
                                    ? token.colorPrimary
                                    : `${token.colorPrimary}E0` // 88% opacity
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
                                (e.currentTarget.style.borderColor = `${token.colorPrimary}`);
                                (e.currentTarget.style.boxShadow = `4px 4px 0 ${token.colorPrimary}66`);
                                (e.currentTarget.style.transform = "translateY(-3px)");
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget.style.borderColor = isSelected
                                    ? token.colorPrimary
                                    : `${token.colorPrimary}E0`);
                                (e.currentTarget.style.boxShadow = `3px 3px 0 ${token.colorPrimary}55`);
                                (e.currentTarget.style.transform = "translateY(0)");
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
                        </Radio>
                    );
                })}
            </Space>
        </Radio.Group>
    );
};

export default MultipleChoiceQuestion;
