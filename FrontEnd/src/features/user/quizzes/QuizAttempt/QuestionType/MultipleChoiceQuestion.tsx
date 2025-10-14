import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Radio, Space } from "antd";
import { useEffect, useState } from "react";

interface MultipleChoiceQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const MultipleChoiceQuestion = ({ question, answer }: MultipleChoiceQuestionPropType) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
    const dispatch = useReduxDispatch();
    const onAnswerChange = (value: string) => {
        setSelectedAnswer(value);
        const answer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: [{ choiceId: value }]
        }
        dispatch(addAnswer(answer))
    };
    useEffect(() => {
        if (answer) {
            const choiceId = answer.QuizAttemptAnswerChoices.at(0)?.choiceId ?? undefined;
            setSelectedAnswer(choiceId);
        }
    }, [answer])

    return (
        <Radio.Group
            onChange={(e) => onAnswerChange(e.target.value)}
            value={selectedAnswer as string}
            className="w-full"
        >
            <Space direction="vertical" className="w-full" size="middle">
                {question.choices.map((option) => (
                    <Radio
                        key={option.id}
                        value={option.id}
                        className="hide-radio-dot w-full flex p-6 md:p-8 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                        style={{
                            margin: 0,
                            borderColor: selectedAnswer === option.id ? "#1890ff" : undefined,
                            backgroundColor: selectedAnswer === option.id ? "#e6f7ff" : undefined,
                        }}
                    >
                        <div className="flex-1 text-base font-semibold sm:text-base md:text-lg lg:text-2xl p-2">{option.text}</div>
                    </Radio>
                ))}
            </Space>
        </Radio.Group>
    );
};

export default MultipleChoiceQuestion;