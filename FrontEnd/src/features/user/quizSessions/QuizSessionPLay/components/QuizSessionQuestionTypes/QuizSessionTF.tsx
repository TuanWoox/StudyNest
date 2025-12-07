import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { QuestionDTO } from '@/types/question/questionDTO';
import { CreateQuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO';
import { QuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/quizAttemptAnswerDTO';
import { useReduxDispatch } from '@/hooks/reduxHook/useReduxDispatch';
import { setAnswer } from '@/store/quizSessionAtemptSlice';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

interface QuizSessionTFProps {
    question: QuestionDTO;
    answer: CreateQuizAttemptAnswerDTO | null;
    submitResult: QuizAttemptAnswerDTO | undefined;
}

const QuizSessionTF: React.FC<QuizSessionTFProps> = ({ question, answer, submitResult }) => {
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

    // Get True and False choices
    const trueChoice = question.choices.find(c => c.text.toLowerCase() === 'true');
    const falseChoice = question.choices.find(c => c.text.toLowerCase() === 'false');

    // Determine styling for True card
    const trueIsCorrect = trueChoice?.isCorrect;
    const trueWasSelected = submitResult?.quizAttemptAnswerChoices.some(c => c.choiceId === trueChoice?.id);
    let trueBorderColor = 'none';
    let trueIcon: React.ReactNode = null;
    if (submitResult && trueChoice) {
        if (trueIsCorrect) {
            trueBorderColor = '4px solid #52c41a';
            trueIcon = <CheckOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
        } else if (trueWasSelected && !trueIsCorrect) {
            trueBorderColor = '4px solid #ff4d4f';
            trueIcon = <CloseOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
        }
    }

    // Determine styling for False card
    const falseIsCorrect = falseChoice?.isCorrect;
    const falseWasSelected = submitResult?.quizAttemptAnswerChoices.some(c => c.choiceId === falseChoice?.id);
    let falseBorderColor = 'none';
    let falseIcon: React.ReactNode = null;
    if (submitResult && falseChoice) {
        if (falseIsCorrect) {
            falseBorderColor = '4px solid #52c41a';
            falseIcon = <CheckOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
        } else if (falseWasSelected && !falseIsCorrect) {
            falseBorderColor = '4px solid #ff4d4f';
            falseIcon = <CloseOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
        }
    }

    return (
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
            {/* True Card */}
            {trueChoice && (
                <Card
                    hoverable={!submitResult}
                    onClick={() => handleSelectAnswer(trueChoice.id)}
                    className={submitResult ? '' : 'cursor-pointer transition-all duration-300'}
                    style={{
                        backgroundColor: '#26890c',
                        border: trueBorderColor,
                        borderRadius: '8px',
                        minHeight: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedChoiceId === trueChoice.id && !submitResult
                            ? '0 0 0 3px #ffffff, 0 0 0 6px #26890c'
                            : '3px 3px 0px rgba(0,0,0,0.2)',
                        transform: selectedChoiceId === trueChoice.id && !submitResult ? 'scale(1.05)' : 'scale(1)',
                        position: 'relative',
                        cursor: submitResult ? 'default' : 'pointer',
                        opacity: submitResult && !trueIsCorrect && !trueWasSelected ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (selectedChoiceId !== trueChoice.id && !submitResult) {
                            e.currentTarget.style.backgroundColor = '#1d6909';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedChoiceId !== trueChoice.id && !submitResult) {
                            e.currentTarget.style.backgroundColor = '#26890c';
                            e.currentTarget.style.transform = 'scale(1)';
                        }
                    }}
                >
                    {(selectedChoiceId === trueChoice.id && !submitResult) && (!submitResult) && (
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
                            <CheckOutlined style={{ color: '#26890c', fontSize: '18px' }} />
                        </div>
                    )}
                    {submitResult && trueIcon && (
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
                            {trueIcon}
                        </div>
                    )}
                    <div className="text-center">
                        <p
                            className="text-white font-bold m-0"
                            style={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '2rem',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            TRUE
                        </p>
                    </div>
                </Card>
            )}

            {/* False Card */}
            {falseChoice && (
                <Card
                    hoverable={!submitResult}
                    onClick={() => handleSelectAnswer(falseChoice.id)}
                    className={submitResult ? '' : 'cursor-pointer transition-all duration-300'}
                    style={{
                        backgroundColor: '#e21b3c',
                        border: falseBorderColor,
                        borderRadius: '8px',
                        minHeight: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: selectedChoiceId === falseChoice.id && !submitResult
                            ? '0 0 0 3px #ffffff, 0 0 0 6px #e21b3c'
                            : '3px 3px 0px rgba(0,0,0,0.2)',
                        transform: selectedChoiceId === falseChoice.id && !submitResult ? 'scale(1.05)' : 'scale(1)',
                        position: 'relative',
                        cursor: submitResult ? 'default' : 'pointer',
                        opacity: submitResult && !falseIsCorrect && !falseWasSelected ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (selectedChoiceId !== falseChoice.id && !submitResult) {
                            e.currentTarget.style.backgroundColor = '#c41230';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedChoiceId !== falseChoice.id && !submitResult) {
                            e.currentTarget.style.backgroundColor = '#e21b3c';
                            e.currentTarget.style.transform = 'scale(1)';
                        }
                    }}
                >
                    {(selectedChoiceId === falseChoice.id && !submitResult) && (!submitResult) && (
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
                            <CheckOutlined style={{ color: '#e21b3c', fontSize: '18px' }} />
                        </div>
                    )}
                    {submitResult && falseIcon && (
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
                            {falseIcon}
                        </div>
                    )}
                    <div className="text-center">
                        <p
                            className="text-white font-bold m-0"
                            style={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '2rem',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            FALSE
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default QuizSessionTF;
