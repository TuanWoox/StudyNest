import { Card, Button, Progress, Row, Col, Space, Tag, Divider } from 'antd'
import { RedoOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

interface ResultHeaderTypeProp {
    score: number | undefined
    id: string | undefined
    correctAnswers: number
    totalQuestions: number
}

const ResultHeader = ({
    score = 0,
    id,
    correctAnswers,
    totalQuestions
}: ResultHeaderTypeProp) => {
    const [animatedScore, setAnimatedScore] = useState(0)
    const darkMode = useOutletContext<boolean>();
    const navigate = useNavigate();

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        let current = 0
        const increment = score / 50

        const animate = () => {
            if (current < score) {
                current += increment
                setAnimatedScore(Math.min(Math.floor(current), score))
                timeout = setTimeout(animate, 20)
            } else {
                setAnimatedScore(score)
            }
        }

        animate()
        return () => clearTimeout(timeout)
    }, [score])

    const onRetake = () => {
        navigate(`/user/quizAttempt/${id}`);
    }

    const getFeedbackMessage = () => {
        if (score < 70) {
            return {
                message: '💡 Keep practicing! Review the explanations below to strengthen your understanding.',
                color: '#faad14',
                background: darkMode ? '#4d3d00' : '#fff7e6',
            }
        } else if (score < 90) {
            return {
                message: '🎯 Good job! You\'re making solid progress. Review the missed questions to achieve mastery.',
                color: '#1890ff',
                background: darkMode ? '#002766' : '#e6f7ff',
            }
        } else {
            return {
                message: '🌟 Excellent work! You\'ve demonstrated strong understanding of the material.',
                color: '#52c41a',
                background: darkMode ? '#1f2a1f' : '#f6ffed',
            }
        }
    }

    const feedback = getFeedbackMessage()
    const incorrectAnswers = totalQuestions - correctAnswers

    const getPerformanceColor = (percent: number) => {
        if (percent >= 90) return '#52c41a'
        if (percent >= 70) return '#1890ff'
        if (percent >= 40) return '#faad14'
        return '#ff4d4f'
    }

    const performanceColor = getPerformanceColor(score)

    return (
        <div className={`w-full ${darkMode ? 'text-white' : 'text-black'}`}>
            {/* Header */}
            <div className='mb-4'>
                <h2 className={`m-0 font-semibold text-xl md:text-3xl tracking-[-0.3px] ${darkMode ? 'text-white' : '#1f1f1f'}`}>
                    Quiz Results
                </h2>
                <p className={`mt-1.5 text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-[#595959]'}`}>
                    A summary of your performance and key insights
                </p>
            </div>

            {/* Card */}
            <Card
                className={`mb-8 rounded-lg border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-[#E2DFE1]'}`}
                bordered={false}
                hoverable={true}
            >
                <Row gutter={[32, 32]}>
                    <Col xs={24}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {/* Title Row */}
                            <Space size="middle" align="center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                                    <ArrowUpOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                </div>
                                <div>
                                    <div className={`text-base font-semibold ${darkMode ? 'text-white' : '#262626'}`}>
                                        Your Score
                                    </div>
                                    <div className={`text-sm ${darkMode ? 'text-gray-300' : '#8c8c8c'}`}>
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
                            />


                            {/* Correct / Incorrect */}
                            <Space size="middle" wrap>
                                <Tag
                                    icon={<CheckCircleOutlined />}
                                    color="success"
                                    className="text-sm px-3 py-1.5 rounded-full"
                                >
                                    {correctAnswers} Correct
                                </Tag>
                                <Tag
                                    icon={<CloseCircleOutlined />}
                                    color="error"
                                    className="text-sm px-3 py-1.5 rounded-full"
                                >
                                    {incorrectAnswers} Incorrect
                                </Tag>
                            </Space>
                        </Space>
                    </Col>
                </Row>

                <Divider className="my-6" />

                {/* Feedback Message */}
                <div
                    className="p-5 rounded-lg text-sm font-medium leading-relaxed mb-6"
                    style={{
                        background: feedback.background,
                        color: feedback.color,
                    }}
                >
                    {feedback.message}
                </div>

                {/* Retake Button */}
                <div className="text-center">
                    <Button
                        type="primary"
                        icon={<RedoOutlined />}
                        size="large"
                        onClick={onRetake}
                        className="rounded-lg px-8 font-medium"
                    >
                        Retake Quiz
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default ResultHeader
