import React from 'react';
import { Card, Typography, Button } from 'antd';
import { CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useAntDesignTheme } from '@/hooks/common';
import { useNavigate } from 'react-router-dom';
import { EQuizSessionStatus } from '@/utils/enums/EQuizSessionStatus';

const { Title, Text } = Typography;

interface QuizSessionClosedProps {
    status: EQuizSessionStatus;
}

const QuizSessionClosed: React.FC<QuizSessionClosedProps> = ({ status }) => {
    const { primaryColor, bgColor } = useAntDesignTheme();
    const navigate = useNavigate();

    const isCompleted = status === EQuizSessionStatus.Completed;
    const isInProgress = status === EQuizSessionStatus.InProgress;
    const icon = isCompleted ? <StopOutlined /> : <CloseCircleOutlined />;
    const title = isCompleted 
        ? 'Quiz Session Completed' 
        : isInProgress 
        ? 'Quiz Session In Progress' 
        : 'Quiz Session Abandoned';
    const message = isCompleted 
        ? 'This quiz session has been completed. Thank you for participating!'
        : isInProgress
        ? 'This quiz session is already in progress. You cannot join at this time.'
        : 'This quiz session has been abandoned and is no longer available.';

    return (
        <div
            style={{
                backgroundColor: bgColor,
                padding: '24px',
                overflow: 'auto',
            }}
            className='mx-auto'
        >
            <Card
                style={{
                    border: `3px solid ${primaryColor}`,
                    borderRadius: 0,
                    boxShadow: `12px 12px 0px ${primaryColor}40`,
                    maxWidth: '800px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '48px 24px',
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 32,
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div style={{ 
                        fontSize: '120px', 
                        color: primaryColor,
                        lineHeight: 1,
                    }}>
                        {icon}
                    </div>
                    <Title
                        level={1}
                        style={{
                            fontFamily: '"Courier New", monospace',
                            margin: 0,
                            color: primaryColor,
                            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                            fontWeight: 'bold',
                        }}
                    >
                        {title}
                    </Title>
                    <Text
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                            display: 'block',
                            lineHeight: 1.6,
                            maxWidth: '500px',
                        }}
                    >
                        {message}
                    </Text>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate('/user/quiz')}
                        style={{
                            fontFamily: '"Courier New", monospace',
                            backgroundColor: primaryColor,
                            border: `3px solid ${primaryColor}`,
                            borderRadius: 0,
                            boxShadow: `6px 6px 0px ${primaryColor}60`,
                            marginTop: 24,
                            height: '52px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            padding: '0 48px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-2px, -2px)';
                            e.currentTarget.style.boxShadow = `8px 8px 0px ${primaryColor}60`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(0, 0)';
                            e.currentTarget.style.boxShadow = `6px 6px 0px ${primaryColor}60`;
                        }}
                    >
                        Back to Quizzes
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default QuizSessionClosed;
