import { Card, Button, Progress, Row, Col, Space, Tag, Divider, theme } from 'antd';
import {
    RedoOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface ResultHeaderTypeProp {
    score: number | undefined;
    id: string | undefined;
    correctAnswers: number;
    totalQuestions: number;
}

const ResultHeader = ({
    score = 0,
    id,
    correctAnswers,
    totalQuestions,
}: ResultHeaderTypeProp) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    // const darkMode = useOutletContext<boolean>();
    const darkMode = useReduxSelector(selectDarkMode);
    const navigate = useNavigate();
    const { token } = theme.useToken();

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        let current = 0;
        const increment = score / 50;

        const animate = () => {
            if (current < score) {
                current += increment;
                setAnimatedScore(Math.min(Math.floor(current), score));
                timeout = setTimeout(animate, 20);
            } else {
                setAnimatedScore(score);
            }
        };

        animate();
        return () => clearTimeout(timeout);
    }, [score]);

    const onRetake = () => navigate(`/user/quiz/quizAttempt/${id}`);

    const getFeedbackMessage = () => {
        if (score < 70) {
            return {
                message:
                    '💡 Keep practicing! Review the explanations below to strengthen your understanding.',
                background: darkMode ? '#4d3d00' : '#fff7e6',
            };
        } else if (score < 90) {
            return {
                message:
                    "🎯 Good job! You're making solid progress. Review the missed questions to achieve mastery.",
                background: darkMode ? '#002766' : '#e6f7ff',
            };
        } else {
            return {
                message:
                    "🌟 Excellent work! You've demonstrated strong understanding of the material.",
                background: darkMode ? '#1f2a1f' : '#f6ffed',
            };
        }
    };

    const feedback = getFeedbackMessage();
    const incorrectAnswers = totalQuestions - correctAnswers;

    const getPerformanceColor = (percent: number) => {
        if (percent >= 90) return '#52c41a';
        if (percent >= 70) return '#1890ff';
        if (percent >= 40) return '#faad14';
        return '#ff4d4f';
    };

    const performanceColor = getPerformanceColor(score);
    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88% opacity
    const shadowColor = `${primaryColor}55`; // 33% opacity

    return (
        <div
            className={`w-full font-['Courier_New',monospace] transition-colors duration-500`}
        >
            {/* Header */}
            <div className="mb-4">
                <h2
                    className={`m-0 font-bold text-2xl tracking-tight`}
                >
                    Quiz Results
                </h2>
                <p
                    className={`mt-1.5 text-xs md:text-sm `}
                >
                    A summary of your performance and key insights
                </p>
            </div>

            {/* Card */}
            <Card
                className="mb-8 transition-all duration-300"
                style={{
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    fontFamily: "'Courier New', monospace",
                }}
                styles={{
                    body: {
                        padding: '24px 28px',
                    }
                }}
            >
                <Row gutter={[32, 32]}>
                    <Col xs={24}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Title Row */}
                            <Space size="middle" align="center">
                                <div
                                    className="w-12 h-12 rounded flex items-center justify-center"
                                    style={{
                                        border: `1.5px solid ${borderColor}`,
                                        boxShadow: `2px 2px 0 ${shadowColor}`,
                                        borderRadius: 0
                                    }}
                                >
                                    <ArrowUpOutlined
                                        style={{
                                            fontSize: 24,
                                            color: primaryColor,
                                        }}
                                    />
                                </div>
                                <div>
                                    <div
                                        className={`text-base font-semibold `}
                                    >
                                        Your Score
                                    </div>
                                    <div
                                        className={`text-sm `}
                                    >
                                        {correctAnswers} out of {totalQuestions} correct
                                    </div>
                                </div>
                            </Space>

                            {/* Progress */}
                            <Progress
                                percent={animatedScore}
                                strokeColor={performanceColor}
                                status={animatedScore === 100 ? 'success' : 'active'}
                                strokeWidth={10}
                                style={{
                                    fontFamily: "'Courier New', monospace",
                                }}
                            />

                            {/* Correct / Incorrect */}
                            <Space size="middle" wrap>
                                <Tag
                                    icon={<CheckCircleOutlined />}
                                    color="success"
                                    style={{
                                        fontFamily: "'Courier New', monospace",
                                        borderRadius: 0,
                                        border: `1px solid ${borderColor}`,
                                        boxShadow: `2px 2px 0 ${shadowColor}`,
                                        padding: '6px 14px',
                                    }}
                                >
                                    {correctAnswers} Correct
                                </Tag>
                                <Tag
                                    icon={<CloseCircleOutlined />}
                                    color="error"
                                    style={{
                                        fontFamily: "'Courier New', monospace",
                                        borderRadius: 0,
                                        border: `1px solid ${borderColor}`,
                                        boxShadow: `2px 2px 0 ${shadowColor}`,
                                        padding: '6px 14px',
                                    }}
                                >
                                    {incorrectAnswers} Incorrect
                                </Tag>
                            </Space>
                        </Space>
                    </Col>
                </Row>

                <Divider className="my-6 border-[#D9D9D9]" />

                {/* Feedback Message */}
                <div
                    className="p-5 rounded text-sm font-medium leading-relaxed mb-6"
                    style={{
                        background: feedback.background,
                        fontFamily: "'Courier New', monospace",
                        border: `1px dashed ${borderColor}`,
                    }}
                >
                    {feedback.message}
                </div>

                {/* Retake Button */}
                <div className="text-center">
                    <Button
                        type="default"
                        icon={<RedoOutlined />}
                        size="large"
                        onClick={onRetake}
                        style={{
                            fontWeight: 600,
                            border: `1.5px solid ${borderColor}`,
                            boxShadow: `2px 2px 0 ${shadowColor}`,
                        }}
                    >
                        Retake Quiz
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ResultHeader;
