import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { QuestionDTO } from '@/types/question/questionDTO';
import { CreateQuizAttemptAnswerDTO } from '@/types/quizAttemptAnswer/createQuizAttemptAnswerDTO';
import { useReduxDispatch } from '@/hooks/reduxHook/useReduxDispatch';
import { useReduxSelector } from '@/hooks/reduxHook/useReduxSelector';
import { setAnswer, selectCurrentAnswer, selectIsTimeUp } from '@/store/quizSessionAtemptSlice';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useAntDesignTheme } from '@/hooks/common';

const { Text } = Typography;

const QuizSessionMSQ: React.FC = () => {
    const dispatch = useReduxDispatch();
    const answer = useReduxSelector(selectCurrentAnswer);
    const isTimeUp = useReduxSelector(selectIsTimeUp);
    const { primaryColor, textColor, bgColor } = useAntDesignTheme();
    const [selectedChoiceIds, setSelectedChoiceIds] = useState<Set<string>>(new Set());

    // Get the question from Redux
    const question = useReduxSelector((state) => state.quizSessionAttempt.questions[state.quizSessionAttempt.currentQuestionIndex]);

    useEffect(() => {
        if (answer && answer.QuizAttemptAnswerChoices?.length > 0) {
            const ids = new Set(answer.QuizAttemptAnswerChoices.map(c => c.choiceId));
            setSelectedChoiceIds(ids);
        } else {
            setSelectedChoiceIds(new Set());
        }
    }, [answer]);

    if (!question) return null;

    const handleToggleAnswer = (choiceId: string) => {
        if (isTimeUp) return;
        const newSelectedIds = new Set(selectedChoiceIds);

        if (newSelectedIds.has(choiceId)) {
            newSelectedIds.delete(choiceId);
        } else {
            newSelectedIds.add(choiceId);
        }

        setSelectedChoiceIds(newSelectedIds);

        const newAnswer: CreateQuizAttemptAnswerDTO = {
            snapShotQuestionId: question.id,
            QuizAttemptAnswerChoices: Array.from(newSelectedIds).map(id => ({ choiceId: id })),
        };
        dispatch(setAnswer(newAnswer));
    };

    const getChoiceStyle = (choiceId: string, isCorrect: boolean) => {
        const isSelected = selectedChoiceIds.has(choiceId);
        
        // Base style
        const style: React.CSSProperties = {
            border: `2px solid ${primaryColor}40`,
            borderRadius: 0,
            minHeight: '80px',
            transition: 'all 0.2s ease',
            cursor: isTimeUp ? 'default' : 'pointer',
            position: 'relative',
            backgroundColor: bgColor,
        };

        // Before time up - show selection
        if (!isTimeUp) {
            if (isSelected) {
                style.border = `3px solid ${primaryColor}`;
                style.boxShadow = `5px 5px 0px ${primaryColor}60`;
                style.transform = 'translate(-2px, -2px)';
                style.backgroundColor = `${primaryColor}08`;
            } else {
                style.boxShadow = `3px 3px 0px ${primaryColor}30`;
            }
        }
        
        // After time up - show correct/incorrect
        if (isTimeUp) {
            if (isCorrect) {
                if (isSelected) {
                    // Correct answer that user selected - vibrant green
                    style.border = `3px solid #10b981`;
                    style.boxShadow = `5px 5px 0px #10b98160`;
                    style.backgroundColor = `#10b98115`;
                } else {
                    // Correct answer but not selected - greyed green
                    style.border = `2px solid #6b7280`;
                    style.boxShadow = `3px 3px 0px #6b728040`;
                    style.backgroundColor = `#6b728010`;
                    style.filter = 'grayscale(50%) opacity(0.6)';
                }
            } else if (isSelected) {
                // Wrong answer that user selected - keep normal color
                style.border = `3px solid #ef4444`;
                style.boxShadow = `5px 5px 0px #ef444460`;
                style.backgroundColor = `#ef444415`;
            } else {
                // Not selected and not correct - grey
                style.border = `2px solid #6b7280`;
                style.boxShadow = `3px 3px 0px #6b728040`;
                style.backgroundColor = `#6b728010`;
                style.filter = 'grayscale(80%) opacity(0.5)';
            }
        }

        return style;
    };

    const getHoverStyle = (choiceId: string): React.CSSProperties => {
        if (isTimeUp) return {};
        const isSelected = selectedChoiceIds.has(choiceId);
        if (isSelected) return {};
        
        return {
            border: `2px solid ${primaryColor}80`,
            boxShadow: `4px 4px 0px ${primaryColor}50`,
            transform: 'translate(-1px, -1px)',
        };
    };

    const renderFeedbackIcon = (choiceId: string, isCorrect: boolean) => {
        if (!isTimeUp) return null;
        
        const isSelected = selectedChoiceIds.has(choiceId);
        
        if (isCorrect) {
            return (
                <div className="absolute top-3 right-3">
                    <CheckCircleFilled style={{ fontSize: '28px', color: '#10b981' }} />
                </div>
            );
        } else if (isSelected) {
            return (
                <div className="absolute top-3 right-3">
                    <CloseCircleFilled style={{ fontSize: '28px', color: primaryColor }} />
                </div>
            );
        }
        
        return null;
    };

    const renderSelectionBadge = (choiceId: string) => {
        if (isTimeUp) return null;
        
        const isSelected = selectedChoiceIds.has(choiceId);
        if (!isSelected) return null;

        return (
            <div 
                className="absolute top-3 right-3"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${primaryColor}60`,
                }}
            >
                <CheckCircleFilled style={{ fontSize: '20px', color: '#ffffff' }} />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            {question.choices.map((choice, index) => (
                <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    index={index}
                    isTimeUp={isTimeUp}
                    primaryColor={primaryColor}
                    textColor={textColor}
                    handleToggleAnswer={handleToggleAnswer}
                    getChoiceStyle={getChoiceStyle}
                    getHoverStyle={getHoverStyle}
                    renderSelectionBadge={renderSelectionBadge}
                    renderFeedbackIcon={renderFeedbackIcon}
                />
            ))}
        </div>
    );
};

// Helper component to avoid hook issues in map
const ChoiceCard: React.FC<{
    choice: any;
    index: number;
    isTimeUp: boolean;
    primaryColor: string;
    textColor: string;
    handleToggleAnswer: (id: string) => void;
    getChoiceStyle: (id: string, isCorrect: boolean) => React.CSSProperties;
    getHoverStyle: (id: string) => React.CSSProperties;
    renderSelectionBadge: (id: string) => React.ReactNode;
    renderFeedbackIcon: (id: string, isCorrect: boolean) => React.ReactNode;
}> = ({
    choice,
    index,
    isTimeUp,
    primaryColor,
    textColor,
    handleToggleAnswer,
    getChoiceStyle,
    getHoverStyle,
    renderSelectionBadge,
    renderFeedbackIcon,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const baseStyle = getChoiceStyle(choice.id, choice.isCorrect);
    const hoverStyle = getHoverStyle(choice.id);

    return (
        <Card
            hoverable={!isTimeUp}
            onClick={() => handleToggleAnswer(choice.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
            bodyStyle={{ padding: '20px' }}
        >
            {renderSelectionBadge(choice.id)}
            {renderFeedbackIcon(choice.id, choice.isCorrect)}
            
            <div className="pr-10">
                <Text
                    strong
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.9rem',
                        color: primaryColor,
                        display: 'block',
                        marginBottom: '8px',
                    }}
                >
                    Option {String.fromCharCode(65 + index)}
                </Text>
                <Text
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '1.05rem',
                        color: textColor,
                        display: 'block',
                        lineHeight: 1.4,
                    }}
                >
                    {choice.text}
                </Text>
            </div>
        </Card>
    );
};

export default QuizSessionMSQ;
