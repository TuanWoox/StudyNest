import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Button } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface TrueFalseQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const TrueFalseQuestion = ({ question, answer }: TrueFalseQuestionPropType) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
    const dispatch = useReduxDispatch();

    const onAnswerChange = (choiceId: string) => {
        setSelectedAnswer(choiceId);
        const answer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: [{ choiceId }]
        }
        dispatch(addAnswer(answer))
    };

    useEffect(() => {
        if (answer) {
            const choiceId = answer.QuizAttemptAnswerChoices.at(0)?.choiceId ?? undefined;
            setSelectedAnswer(choiceId);
        }
    }, [answer])

    // Find True and False choices
    const trueChoice = question.choices.find(c => c.text.toLowerCase() === "true");
    const falseChoice = question.choices.find(c => c.text.toLowerCase() === "false");

    return (
        <div className="grid grid-cols-2 gap-6 w-full">
            {trueChoice && (
                <Button
                    size="middle"
                    type={selectedAnswer === trueChoice.id ? "primary" : "default"}
                    icon={<CheckOutlined style={{ fontSize: "24px" }} />}
                    onClick={() => onAnswerChange(trueChoice.id)}
                    style={{
                        height: "auto",
                        minHeight: "120px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        padding: "24px",
                        backgroundColor: selectedAnswer === trueChoice.id ? "#52c41a" : undefined,
                        borderColor: selectedAnswer === trueChoice.id ? "#52c41a" : "#d9d9d9",
                        color: selectedAnswer === trueChoice.id ? "#fff" : undefined,
                        borderWidth: "2px",
                    }}
                >
                    <span className="text-base font-bold sm:text-base md:text-lg lg:text-2xl">True</span>
                </Button>
            )}

            {falseChoice && (
                <Button
                    size="middle"
                    type={selectedAnswer === falseChoice.id ? "primary" : "default"}
                    icon={<CloseOutlined style={{ fontSize: "24px" }} />}
                    onClick={() => onAnswerChange(falseChoice.id)}
                    style={{
                        height: "auto",
                        minHeight: "120px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        padding: "24px",
                        backgroundColor: selectedAnswer === falseChoice.id ? "#ff4d4f" : undefined,
                        borderColor: selectedAnswer === falseChoice.id ? "#ff4d4f" : "#d9d9d9",
                        color: selectedAnswer === falseChoice.id ? "#fff" : undefined,
                        borderWidth: "2px",
                    }}
                >
                    <span className="text-base font-bold sm:text-base md:text-lg lg:text-2xl">False</span>
                </Button>
            )}
        </div>
    );
};

export default TrueFalseQuestion;