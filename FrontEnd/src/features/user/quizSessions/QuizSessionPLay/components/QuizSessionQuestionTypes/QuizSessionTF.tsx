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

const QuizSessionTF: React.FC = () => {
    const dispatch = useReduxDispatch();
    const answer = useReduxSelector(selectCurrentAnswer);
    const isTimeUp = useReduxSelector(selectIsTimeUp);
    const { primaryColor, textColor, bgColor } = useAntDesignTheme();
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

    // Get the question from Redux
    const question = useReduxSelector((state) => state.quizSessionAttempt.questions[state.quizSessionAttempt.currentQuestionIndex]);

    useEffect(() => {
        if (answer && answer.QuizAttemptAnswerChoices?.length > 0) {
            setSelectedChoiceId(answer.QuizAttemptAnswerChoices[0].choiceId);
        } else {
            setSelectedChoiceId(null);
        }
    }, [answer]);

    if (!question) return null;

    const handleSelectAnswer = (choiceId: string) => {
        if (isTimeUp) return;
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

    const getChoiceStyle = (choiceId: string | undefined, isCorrect: boolean | undefined) => {
        if (!choiceId) return {};
        
        const isSelected = selectedChoiceId === choiceId;
        
        // Base style
        const style: React.CSSProperties = {
            border: `2px solid ${primaryColor}40`,
            borderRadius: 0,
            minHeight: '120px',
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

    const getHoverStyle = (choiceId: string | undefined): React.CSSProperties => {
        if (!choiceId || isTimeUp) return {};
        const isSelected = selectedChoiceId === choiceId;
        if (isSelected) return {};
        
        return {
            border: `2px solid ${primaryColor}80`,
            boxShadow: `4px 4px 0px ${primaryColor}50`,
            transform: 'translate(-1px, -1px)',
        };
    };

    const renderFeedbackIcon = (choiceId: string | undefined, isCorrect: boolean | undefined) => {
        if (!isTimeUp || !choiceId) return null;
        
        const isSelected = selectedChoiceId === choiceId;
        
        if (isCorrect) {
            return (
                <div className="absolute top-3 right-3">
                    <CheckCircleFilled style={{ fontSize: '32px', color: '#10b981' }} />
                </div>
            );
        } else if (isSelected) {
            return (
                <div className="absolute top-3 right-3">
                    <CloseCircleFilled style={{ fontSize: '32px', color: primaryColor }} />
                </div>
            );
        }
        
        return null;
    };

    const renderSelectionBadge = (choiceId: string | undefined) => {
        if (isTimeUp || !choiceId) return null;
        
        const isSelected = selectedChoiceId === choiceId;
        if (!isSelected) return null;

        return (
            <div 
                className="absolute top-3 right-3"
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${primaryColor}60`,
                }}
            >
                <CheckCircleFilled style={{ fontSize: '22px', color: '#ffffff' }} />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
            {/* True Card */}
            {trueChoice && (
                <TFChoiceCard
                    choice={trueChoice}
                    label="TRUE"
                    isTimeUp={isTimeUp}
                    textColor={textColor}
                    handleSelectAnswer={handleSelectAnswer}
                    getChoiceStyle={getChoiceStyle}
                    getHoverStyle={getHoverStyle}
                    renderSelectionBadge={renderSelectionBadge}
                    renderFeedbackIcon={renderFeedbackIcon}
                />
            )}

            {/* False Card */}
            {falseChoice && (
                <TFChoiceCard
                    choice={falseChoice}
                    label="FALSE"
                    isTimeUp={isTimeUp}
                    textColor={textColor}
                    handleSelectAnswer={handleSelectAnswer}
                    getChoiceStyle={getChoiceStyle}
                    getHoverStyle={getHoverStyle}
                    renderSelectionBadge={renderSelectionBadge}
                    renderFeedbackIcon={renderFeedbackIcon}
                />
            )}
        </div>
    );
};

// Helper component to avoid hook issues
const TFChoiceCard: React.FC<{
    choice: any;
    label: string;
    isTimeUp: boolean;
    textColor: string;
    handleSelectAnswer: (id: string) => void;
    getChoiceStyle: (id: string | undefined, isCorrect: boolean | undefined) => React.CSSProperties;
    getHoverStyle: (id: string | undefined) => React.CSSProperties;
    renderSelectionBadge: (id: string | undefined) => React.ReactNode;
    renderFeedbackIcon: (id: string | undefined, isCorrect: boolean | undefined) => React.ReactNode;
}> = ({
    choice,
    label,
    isTimeUp,
    textColor,
    handleSelectAnswer,
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
            onClick={() => handleSelectAnswer(choice.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
        >
            {renderSelectionBadge(choice.id)}
            {renderFeedbackIcon(choice.id, choice.isCorrect)}
            
            <Text
                strong
                style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '1.5rem',
                    color: textColor,
                    display: 'block',
                }}
            >
                {label}
            </Text>
        </Card>
    );
};

export default QuizSessionTF;
