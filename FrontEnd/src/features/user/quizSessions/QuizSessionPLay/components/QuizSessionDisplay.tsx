import React from 'react';
import { Card, Progress, Typography, Image, Spin } from 'antd';
import { useReduxSelector } from '@/hooks/reduxHook/useReduxSelector';
import { selectQuizSessionCard, selectQuizSessionProgress } from '@/store/quizSessionAtemptSlice';
import { useAntDesignTheme } from '@/hooks/common';
import { QuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/quizAttemptAnswerDTO';
import QuizSessionMCQ from './QuizSessionQuestionTypes/QuizSessionMCQ';
import QuizSessionMSQ from './QuizSessionQuestionTypes/QuizSessionMSQ';
import QuizSessionTF from './QuizSessionQuestionTypes/QuizSessionTF';

const { Title, Text, Paragraph } = Typography;

interface QuizSessionDisplayProps {
    submitResult: QuizAttemptAnswerDTO | undefined;
    isSubmitting: boolean;
}

const QuizSessionDisplay: React.FC<QuizSessionDisplayProps> = ({ submitResult, isSubmitting }) => {
    const { currentQuestion, currentAnswer } = useReduxSelector(selectQuizSessionCard);
    const { currentQuestionNumber, totalQuestions } = useReduxSelector(selectQuizSessionProgress);
    const { primaryColor, bgColor, cardBorderStyle, cardShadowStyle } = useAntDesignTheme();

    if (!currentQuestion) {
        return (
            <div
                className="w-full min-h-screen flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
            >
                <Card
                    style={{
                        border: cardBorderStyle,
                        borderRadius: 0,
                        boxShadow: cardShadowStyle,
                        minWidth: '300px',
                    }}
                >
                    <Text style={{ fontFamily: '"Courier New", monospace' }}>
                        Waiting for questions...
                    </Text>
                </Card>
            </div>
        );
    }

    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;

    return (
        <div
            className="w-full min-h-screen overflow-y-auto p-4"
            style={{ backgroundColor: bgColor }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Progress Header */}
                <Card
                    style={{
                        border: cardBorderStyle,
                        borderRadius: 0,
                        boxShadow: cardShadowStyle,
                        marginBottom: 12
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <Text
                            strong
                            style={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '0.9rem',
                            }}
                        >
                            Question {currentQuestionNumber} of {totalQuestions}
                        </Text>
                        <Text
                            style={{
                                fontFamily: '"Courier New", monospace',
                                color: primaryColor,
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                            }}
                        >
                            {Math.round(progressPercent)}%
                        </Text>
                    </div>
                    <Progress
                        percent={progressPercent}
                        strokeColor={primaryColor}
                        trailColor={`${primaryColor}20`}
                        showInfo={false}
                        strokeWidth={8}
                    />
                </Card>

                {/* Question Card */}
                <Card
                    style={{
                        border: `2px solid ${primaryColor}`,
                        borderRadius: 0,
                        boxShadow: `4px 4px 0px ${primaryColor}40`,
                        backgroundColor: `${primaryColor}05`,
                        marginBottom: 16
                    }}
                >
                    <Title
                        level={3}
                        className="text-center mb-4"
                        style={{
                            fontFamily: '"Courier New", monospace',
                            color: primaryColor,
                            fontSize: '1.3rem',
                        }}
                    >
                        {currentQuestion.name}
                    </Title>

                    {currentQuestion.imageUrl && (
                        <div className="mb-4 flex justify-center">
                            <Image
                                src={currentQuestion.imageUrl}
                                alt="Question"
                                className="max-w-full"
                                style={{
                                    maxHeight: '250px',
                                    objectFit: 'contain',
                                    border: `2px solid ${primaryColor}`,
                                    boxShadow: `3px 3px 0px ${primaryColor}40`,
                                }}
                                preview={{
                                    mask: 'Click to view full size'
                                }}
                            />
                        </div>
                    )}
                </Card>

                {/* Answer Options */}
                <div className="relative">
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded" style={{ pointerEvents: 'all' }}>
                            <Spin size="large" />
                        </div>
                    )}
                    <div style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                        {currentQuestion.type.toLowerCase() === 'mcq' && (
                            <QuizSessionMCQ question={currentQuestion} answer={currentAnswer} submitResult={submitResult} />
                        )}
                        {currentQuestion.type.toLowerCase() === 'msq' && (
                            <QuizSessionMSQ question={currentQuestion} answer={currentAnswer} submitResult={submitResult} />
                        )}
                        {currentQuestion.type.toLowerCase() === 'tf' && (
                            <QuizSessionTF question={currentQuestion} answer={currentAnswer} submitResult={submitResult} />
                        )}
                    </div>
                </div>

                {/* Explanation - Show after submission */}
                {submitResult && currentQuestion.explanation && (
                    <Card
                        style={{
                            border: submitResult.isCorrect ? '2px solid #52c41a' : '2px solid #ff4d4f',
                            borderRadius: 0,
                            boxShadow: submitResult.isCorrect
                                ? '4px 4px 0px rgba(82, 196, 26, 0.3)'
                                : '4px 4px 0px rgba(255, 77, 79, 0.3)',
                            backgroundColor: submitResult.isCorrect ? '#f6ffed' : '#fff2f0',
                            marginTop: 16,
                        }}
                    >
                        <div className="flex items-start gap-2">
                            <div
                                style={{
                                    fontSize: '20px',
                                    marginTop: '2px',
                                }}
                            >
                                {submitResult.isCorrect ? '✅' : '❌'}
                            </div>
                            <div className="flex-1">
                                <Title
                                    level={5}
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        color: submitResult.isCorrect ? '#52c41a' : '#ff4d4f',
                                        marginBottom: '6px',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {submitResult.isCorrect ? 'Correct!' : 'Incorrect'}
                                </Title>
                                <Paragraph
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        margin: 0,
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {currentQuestion.explanation}
                                </Paragraph>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default QuizSessionDisplay;
