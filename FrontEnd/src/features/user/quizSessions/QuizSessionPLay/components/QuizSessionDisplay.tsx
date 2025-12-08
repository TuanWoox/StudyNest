import React, { useState, useEffect } from 'react';
import { Card, Progress, Typography, Image } from 'antd';
import { useReduxSelector } from '@/hooks/reduxHook/useReduxSelector';
import { useReduxDispatch } from '@/hooks/reduxHook/useReduxDispatch';
import { selectQuizSessionCard, selectQuizSessionProgress, selectIsTimeUp, setIsTimeUp } from '@/store/quizSessionAtemptSlice';
import { useAntDesignTheme } from '@/hooks/common';
import useGetQuizSessionById from '@/hooks/quizSessionHook/useGetQuizSessionById';
import { useParams } from 'react-router-dom';
import QuizSessionMCQ from './QuizSessionQuestionTypes/QuizSessionMCQ';
import QuizSessionMSQ from './QuizSessionQuestionTypes/QuizSessionMSQ';
import QuizSessionTF from './QuizSessionQuestionTypes/QuizSessionTF';

const { Title, Text, Paragraph } = Typography;

const QuizSessionDisplay: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { data: quizSession } = useGetQuizSessionById(sessionId);
    const { currentQuestion } = useReduxSelector(selectQuizSessionCard);
    const { currentQuestionNumber, totalQuestions } = useReduxSelector(selectQuizSessionProgress);
    const isTimeUp = useReduxSelector(selectIsTimeUp);
    const { primaryColor, bgColor, cardBorderStyle, cardShadowStyle } = useAntDesignTheme();
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const dispatch = useReduxDispatch();

    // Initialize and countdown timer for each question
    useEffect(() => {
        if (!currentQuestion || !quizSession?.timeForEachQuestion || isTimeUp) return;
        
        setTimeRemaining(quizSession.timeForEachQuestion);
        
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    dispatch(setIsTimeUp(true));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestion?.id, quizSession?.timeForEachQuestion, isTimeUp, dispatch, currentQuestion]);

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
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="w-full h-screen overflow-y-auto p-4"
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
                        <div className="flex items-center gap-4">
                            {!isTimeUp && timeRemaining > 0 && (
                                <Text
                                    strong
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        fontSize: '1rem',
                                        color: timeRemaining <= 10 ? '#ef4444' : primaryColor,
                                    }}
                                >
                                    ⏱️ {formatTime(timeRemaining)}
                                </Text>
                            )}
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
                    <div className="flex items-center justify-center mb-3">
                        <div
                            style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                border: `2px solid ${primaryColor}`,
                                backgroundColor: bgColor,
                                boxShadow: `2px 2px 0px ${primaryColor}60`,
                            }}
                        >
                            <Text
                                strong
                                style={{
                                    fontFamily: '"Courier New", monospace',
                                    fontSize: '0.85rem',
                                    color: primaryColor,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {currentQuestion.type.toLowerCase() === 'mcq' && '📝 Multiple Choice (Select One)'}
                                {currentQuestion.type.toLowerCase() === 'msq' && '☑️ Multiple Select (Select All That Apply)'}
                                {currentQuestion.type.toLowerCase() === 'tf' && '✓✗ True or False'}
                            </Text>
                        </div>
                    </div>
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
                <div>
                    {currentQuestion.type.toLowerCase() === 'mcq' && (
                        <QuizSessionMCQ />
                    )}
                    {currentQuestion.type.toLowerCase() === 'msq' && (
                        <QuizSessionMSQ />
                    )}
                    {currentQuestion.type.toLowerCase() === 'tf' && (
                        <QuizSessionTF />
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizSessionDisplay;
