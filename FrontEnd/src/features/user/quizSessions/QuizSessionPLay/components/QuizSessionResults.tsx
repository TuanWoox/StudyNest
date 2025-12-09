import React from 'react';
import { Card, Typography, Table, Progress, Button } from 'antd';
import { TrophyOutlined, UserOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { QuizAttemptDTO } from '@/types/quizAttempt/quizAttemptDTO';
import { useAntDesignTheme } from '@/hooks/common';
import { useNavigate } from 'react-router-dom';
import { selectQuizAttempt } from '@/store/quizSessionAtemptSlice';
import { useReduxSelector } from '@/hooks/reduxHook/useReduxSelector';

const { Title, Text } = Typography;

interface QuizSessionResultsProps {
    quizSessionAttempts: QuizAttemptDTO[];
}

const QuizSessionResults: React.FC<QuizSessionResultsProps> = ({ quizSessionAttempts }) => {
    const { primaryColor, bgColor } = useAntDesignTheme();
    const navigate = useNavigate();
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    // Sort by score descending
    const sortedAttempts = [...quizSessionAttempts].sort((a, b) => b.score - a.score);
    const averageScore = sortedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / sortedAttempts.length;

    const columns = [
        {
            title: 'Rank',
            key: 'rank',
            width: 80,
            render: (_: any, __: any, index: number) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                    <Text
                        strong
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '1.2rem',
                        }}
                    >
                        {index < 3 ? medals[index] : `#${index + 1}`}
                    </Text>
                );
            },
        },
        {
            title: 'Player',
            dataIndex: ['user', 'userName'],
            key: 'userName',
            render: (userName: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined style={{ color: primaryColor }} />
                    <Text
                        strong
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '1rem',
                        }}
                    >
                        {userName}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            width: 200,
            render: (score: number) => (
                <div>
                    <Text
                        strong
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '1.1rem',
                            color: primaryColor,
                        }}
                    >
                        {score.toFixed(1)}%
                    </Text>
                    <Progress
                        percent={score}
                        strokeColor={primaryColor}
                        trailColor={`${primaryColor}20`}
                        showInfo={false}
                        size="small"
                    />
                </div>
            ),
        },
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: bgColor,
                padding: '20px',
                overflow: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: "100vw"
            }}
            className="[&::-webkit-scrollbar]:hidden"
        >
            <div style={{ maxWidth: '1200px', width: '100%' }}>
                {/* Header Card */}
                <Card
                    style={{
                        border: `2px solid ${primaryColor}`,
                        borderRadius: 0,
                        boxShadow: `6px 6px 0px ${primaryColor}40`,
                        backgroundColor: `${primaryColor}05`,
                        marginBottom: 24,
                        textAlign: 'center',
                        maxWidth: '800px',
                        margin: '0 auto 24px auto',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <TrophyOutlined style={{ fontSize: '48px', color: primaryColor }} />
                        <Title
                            level={2}
                            style={{
                                fontFamily: '"Courier New", monospace',
                                margin: 0,
                                color: primaryColor,
                            }}
                        >
                            Quiz Session Results
                        </Title>
                        <Text
                            style={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '1rem',
                            }}
                        >
                            {sortedAttempts.length} player(s) participated • Average score: {averageScore.toFixed(1)}%
                        </Text>
                    </div>
                </Card>

                {/* Podium - Top 5 */}
                {sortedAttempts.length >= 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="flex items-end justify-center gap-4 mb-6">
                        {/* 2nd Place */}
                        {sortedAttempts[1] && (
                            <Card
                                style={{
                                    border: `2px solid ${primaryColor}`,
                                    borderRadius: 0,
                                    boxShadow: `6px 6px 0px ${primaryColor}40`,
                                    width: '200px',
                                    height: '240px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🥈</div>
                                <Text
                                    strong
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        fontSize: '1.1rem',
                                        display: 'block',
                                        marginBottom: 8,
                                    }}
                                >
                                    {sortedAttempts[1].user.userName}
                                </Text>
                                <Title
                                    level={2}
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        color: primaryColor,
                                        margin: 0,
                                        fontSize: '1.8rem',
                                    }}
                                >
                                    {sortedAttempts[1].score.toFixed(1)}%
                                </Title>
                            </Card>
                        )}

                        {/* 1st Place */}
                        {sortedAttempts[0] && (
                            <Card
                                style={{
                                    border: `3px solid ${primaryColor}`,
                                    borderRadius: 0,
                                    boxShadow: `8px 8px 0px ${primaryColor}60`,
                                    width: '240px',
                                    height: '280px',
                                    textAlign: 'center',
                                    backgroundColor: `${primaryColor}08`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: 12 }}>🥇</div>
                                <Text
                                    strong
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        fontSize: '1.3rem',
                                        display: 'block',
                                        marginBottom: 12,
                                    }}
                                >
                                    {sortedAttempts[0].user.userName}
                                </Text>
                                <Title
                                    level={1}
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        color: primaryColor,
                                        margin: 0,
                                        fontSize: '2.2rem',
                                    }}
                                >
                                    {sortedAttempts[0].score.toFixed(1)}%
                                </Title>
                            </Card>
                        )}

                        {/* 3rd Place */}
                        {sortedAttempts[2] && (
                            <Card
                                style={{
                                    border: `2px solid ${primaryColor}`,
                                    borderRadius: 0,
                                    boxShadow: `6px 6px 0px ${primaryColor}40`,
                                    width: '200px',
                                    height: '220px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🥉</div>
                                <Text
                                    strong
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        fontSize: '1.1rem',
                                        display: 'block',
                                        marginBottom: 8,
                                    }}
                                >
                                    {sortedAttempts[2].user.userName}
                                </Text>
                                <Title
                                    level={2}
                                    style={{
                                        fontFamily: '"Courier New", monospace',
                                        color: primaryColor,
                                        margin: 0,
                                        fontSize: '1.8rem',
                                    }}
                                >
                                    {sortedAttempts[2].score.toFixed(1)}%
                                </Title>
                            </Card>
                        )}
                    </div>

                    {/* 4th and 5th Place */}
                    {sortedAttempts.length > 3 && (
                        <div className="flex justify-center gap-4 mb-4">
                        {sortedAttempts.slice(3, 5).map((attempt, index) => {
                            const position = index + 4;
                            const emoji = position === 4 ? '4️⃣' : '5️⃣';
                            
                            return (
                                <Card
                                    key={attempt.id}
                                    style={{
                                        border: `2px solid ${primaryColor}`,
                                        borderRadius: 0,
                                        boxShadow: `4px 4px 0px ${primaryColor}40`,
                                        width: '180px',
                                        height: '160px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{emoji}</div>
                                    <Text
                                        strong
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            fontSize: '1rem',
                                            display: 'block',
                                            marginBottom: 6,
                                        }}
                                    >
                                        {attempt.user.userName}
                                    </Text>
                                    <Title
                                        level={3}
                                        style={{
                                            fontFamily: '"Courier New", monospace',
                                            color: primaryColor,
                                            margin: 0,
                                            fontSize: '1.4rem',
                                        }}
                                    >
                                        {attempt.score.toFixed(1)}%
                                    </Title>
                                </Card>
                            );
                        })}
                        </div>
                    )}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    <Button
                        size="large"
                        type="primary"
                        onClick={() => {
                            navigate(`/user/quiz/quizAttemptResult/${quizAttempt?.id}`, {
                                state: { fromQuizSession: true }
                            })
                        }}
                        style={{
                            fontFamily: '"Courier New", monospace',
                            backgroundColor: primaryColor,
                            border: `2px solid ${primaryColor}`,
                            borderRadius: 0,
                            boxShadow: `3px 3px 0px ${primaryColor}60`,
                        }}
                    >
                        Close & Review Results
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuizSessionResults;
