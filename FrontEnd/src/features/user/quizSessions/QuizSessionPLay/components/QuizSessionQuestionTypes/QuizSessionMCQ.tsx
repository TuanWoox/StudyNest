import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { QuestionDTO } from '@/types/question/questionDTO';
import { CreateQuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO';
import { QuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/quizAttemptAnswerDTO';
import { useReduxDispatch } from '@/hooks/reduxHook/useReduxDispatch';
import { setAnswer } from '@/store/quizSessionAtemptSlice';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface QuizSessionMCQProps {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | null;
    submitResult: QuizAttemptAnswerDTO | undefined;
}

// Kahoot-style colors for different answer options
const ANSWER_COLORS = [
    { bg: '#e21b3c', hover: '#c41230', name: 'Red' },
    { bg: '#1368ce', hover: '#0d4fa3', name: 'Blue' },
    { bg: '#ffa602', hover: '#d88e02', name: 'Yellow' },
    { bg: '#26890c', hover: '#1d6909', name: 'Green' },
];

const QuizSessionMCQ: React.FC<QuizSessionMCQProps> = ({ question, answer, submitResult }) => {
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
    const dispatch = useReduxDispatch();

    useEffect(() => {
        if (answer && answer.QuizAttemptAnswerChoices?.length > 0) {
            setSelectedChoiceId(answer.QuizAttemptAnswerChoices[0].choiceId);
        } else {
            setSelectedChoiceId(null);
        }
    }, [answer]);

    const handleSelectAnswer = (choiceId: string) => {
        if (submitResult) return; // Disable selection after submission
        setSelectedChoiceId(choiceId);
        const newAnswer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: [{ choiceId }],
        };
        dispatch(setAnswer(newAnswer));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">{question.choices.slice(0, 4).map((choice, index) => {
            const colorScheme = ANSWER_COLORS[index % ANSWER_COLORS.length];
            const isSelected = selectedChoiceId === choice.id;
            const isCorrectAnswer = choice.isCorrect;
            const wasSelectedByUser = submitResult?.quizAttemptAnswerChoices.some(c => c.choiceId === choice.id);

            // Determine the visual state after submission
            let borderColor = 'none';
            let icon: React.ReactNode = null;
            if (submitResult) {
                if (isCorrectAnswer) {
                    borderColor = '4px solid #52c41a'; // Green border for correct answer
                    icon = <CheckOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
                } else if (wasSelectedByUser && !isCorrectAnswer) {
                    borderColor = '4px solid #ff4d4f'; // Red border for wrong selection
                    icon = <CloseOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
                }
            }

            return (
                <Card
                    key={choice.id}
                    hoverable={!submitResult}
                    onClick={() => handleSelectAnswer(choice.id)}
                    className={submitResult ? '' : 'cursor-pointer transition-all duration-300'}
                    style={{
                        backgroundColor: colorScheme.bg,
                        border: borderColor,
                        borderRadius: 0,
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSelected && !submitResult
                            ? `0 0 0 4px #ffffff, 0 0 0 8px ${colorScheme.bg}`
                            : '3px 3px 0px rgba(0,0,0,0.2)',
                        transform: isSelected && !submitResult ? 'scale(1.05)' : 'scale(1)',
                        position: 'relative',
                        cursor: submitResult ? 'default' : 'pointer',
                        opacity: submitResult && !isCorrectAnswer && !wasSelectedByUser ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected && !submitResult) {
                            e.currentTarget.style.backgroundColor = colorScheme.hover;
                            e.currentTarget.style.transform = 'scale(1.03)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected && !submitResult) {
                            e.currentTarget.style.backgroundColor = colorScheme.bg;
                            e.currentTarget.style.transform = 'scale(1)';
                        }
                    }}
                >
                    {(isSelected && !submitResult) && (!submitResult) && (
                        <div
                            className="absolute top-3 right-3"
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CheckOutlined style={{ color: colorScheme.bg, fontSize: '20px' }} />
                        </div>
                    )}
                    {submitResult && icon && (
                        <div
                            className="absolute top-3 right-3"
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {icon}
                        </div>
                    )}
                    <div className="text-center px-3">
                        <p
                            className="text-white font-bold m-0"
                            style={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '1.1rem',
                                lineHeight: 1.3,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            {choice.text}
                        </p>
                    </div>
                </Card>
            );
        })}
        </div>
    );
};

export default QuizSessionMCQ;
