import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { addAnswer, removeAnswer } from "@/store/quizAttemptSlice";
import { QuestionDTO } from "@/types/question/questionDTO";
import { CreateQuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO";
import { Checkbox, Space } from "antd";
import { useEffect, useState } from "react";

interface MultipleSelectQuestionPropType {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | undefined;
}

const MultipleSelectQuestion = ({ question, answer }: MultipleSelectQuestionPropType) => {
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const dispatch = useReduxDispatch();

    const onAnswerChange = (checkedValues: string[]) => {
        setSelectedAnswers(checkedValues);
        if (checkedValues.length > 0) {
            const answer: CreateQuizAttemptAnswerDTO = {
                snapShotQuestionId: question.id,
                QuizAttemptAnswerChoices: checkedValues.map(choiceId => ({ choiceId }))
            }
            dispatch(addAnswer(answer))
        } else {
            dispatch(removeAnswer(question.id));
        }
    };

    useEffect(() => {
        if (answer) {
            const choiceIds = answer.QuizAttemptAnswerChoices.map(choice => choice.choiceId);
            setSelectedAnswers(choiceIds);
        }
    }, [answer])

    return (
        <Checkbox.Group
            onChange={(checkedValues) => onAnswerChange(checkedValues as string[])}
            value={selectedAnswers}
            className="w-full"
        >
            <Space direction="vertical" className="w-full" size="middle">
                {question.choices.map((option) => (
                    <Checkbox
                        key={option.id}
                        value={option.id}
                        className="hide-checkbox-dot w-full flex p-6 md:p-8 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                        style={{
                            margin: 0,
                            borderColor: selectedAnswers.includes(option.id) ? "#1890ff" : undefined,
                            backgroundColor: selectedAnswers.includes(option.id) ? "#e6f7ff" : undefined,
                        }}
                    >
                        <div className="flex-1 text-base font-semibold sm:text-base md:text-lg lg:text-2xl p-2">{option.text}</div>
                    </Checkbox>
                ))}
            </Space>
        </Checkbox.Group>
    );
};

export default MultipleSelectQuestion;