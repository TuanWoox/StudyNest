import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Button, theme } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface TrueFalseQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const TrueFalseQuestion = ({ question, answer }: TrueFalseQuestionPropType) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
        undefined
    );
    const dispatch = useReduxDispatch();
    const { token } = theme.useToken();

    const onAnswerChange = (choiceId: string) => {
        setSelectedAnswer(choiceId);
        const newAnswer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: [{ choiceId }],
        };
        dispatch(addAnswer(newAnswer));
    };

    useEffect(() => {
        if (answer) {
            const choiceId =
                answer.QuizAttemptAnswerChoices.at(0)?.choiceId ?? undefined;
            setSelectedAnswer(choiceId);
        }
    }, [answer]);

    // Find True and False choices
    const trueChoice = question.choices.find(
        (c) => c.text.toLowerCase() === "true"
    );
    const falseChoice = question.choices.find(
        (c) => c.text.toLowerCase() === "false"
    );

    // Common retro styles
    const primary = token.colorPrimary;
    const borderColor = `${primary}E0`; // 88% opacity
    const shadowColor = `${primary}55`; // 33% opacity
    const hoverShadowColor = `${primary}66`;
    const bgColor = token.colorPrimaryBg;
    const textColor = token.colorText;

    const getButtonStyle = (isSelected: boolean, color: string) => ({
        height: "auto",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "24px",
        border: `1.5px solid ${isSelected ? color : borderColor}`,
        boxShadow: `3px 3px 0 ${shadowColor}`,
        fontFamily: `"Courier New", "IBM Plex Mono", monospace`,
        fontWeight: 600,
        fontSize: "1.1rem",
        letterSpacing: "0.3px",
        transition: "all 0.25s ease-in-out",
        transform: "translateY(0)",
        color: isSelected ? "#fff" : textColor,
        backgroundColor: isSelected ? color : bgColor,
    });

    return (
        <div className="grid grid-cols-2 gap-6 w-full">
            {/* TRUE button */}
            {trueChoice && (
                <Button
                    size="large"
                    icon={<CheckOutlined style={{ fontSize: "24px" }} />}
                    onClick={() => onAnswerChange(trueChoice.id)}
                    style={getButtonStyle(
                        selectedAnswer === trueChoice.id,
                        "#52c41a" // retro green for True
                    )}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `4px 4px 0 ${hoverShadowColor}`;
                        e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                        const isSelected = selectedAnswer === trueChoice.id;
                        e.currentTarget.style.borderColor = isSelected
                            ? "#52c41a"
                            : borderColor;
                        e.currentTarget.style.boxShadow = `3px 3px 0 ${shadowColor}`;
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    <span
                        style={{
                            fontFamily: `"Courier New", "IBM Plex Mono", monospace`,
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            letterSpacing: "0.5px",
                        }}
                    >
                        TRUE
                    </span>
                </Button>
            )}

            {/* FALSE button */}
            {falseChoice && (
                <Button
                    size="large"
                    icon={<CloseOutlined style={{ fontSize: "24px" }} />}
                    onClick={() => onAnswerChange(falseChoice.id)}
                    style={getButtonStyle(
                        selectedAnswer === falseChoice.id,
                        "#ff4d4f" // retro red for False
                    )}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.boxShadow = `4px 4px 0 ${hoverShadowColor}`;
                        e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                        const isSelected = selectedAnswer === falseChoice.id;
                        e.currentTarget.style.borderColor = isSelected
                            ? "#ff4d4f"
                            : borderColor;
                        e.currentTarget.style.boxShadow = `3px 3px 0 ${shadowColor}`;
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    <span
                        style={{
                            fontFamily: `"Courier New", "IBM Plex Mono", monospace`,
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            letterSpacing: "0.5px",
                        }}
                    >
                        FALSE
                    </span>
                </Button>
            )}
        </div>
    );
};

export default TrueFalseQuestion;
