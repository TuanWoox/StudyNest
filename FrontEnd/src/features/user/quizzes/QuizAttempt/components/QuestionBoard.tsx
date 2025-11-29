import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector"
import { selectIsNeededToSubmitQuiz, selectQuestion, selectQuestionsAndAnswerList, selectQuizProgress } from "@/store/quizAttemptSlice";
import { Tooltip, Card, Progress, Button, Typography, Divider, Modal } from "antd"
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import useIsMobile from "@/hooks/common/useIsMobile";
import React, { useEffect, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";


const { Title, Text } = Typography;

interface QuestionBoardProps {
    isSubmitting: boolean,
    onSubmit: () => void;
}

const QuestionBoard: React.FC<QuestionBoardProps> = ({ isSubmitting, onSubmit }) => {
    const { borderColor, shadowColor } = useAntDesignTheme();
    const { currentQuestionIndex, answeredCount, totalQuestions, progressPercentage } = useReduxSelector(selectQuizProgress);
    const { questions, answeredList } = useReduxSelector(selectQuestionsAndAnswerList);
    const dispatch = useReduxDispatch();
    const { isMobile } = useIsMobile();
    const isNeededToSubmit = useReduxSelector(selectIsNeededToSubmitQuiz);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (isNeededToSubmit) {
            onSubmit();
        }
    }, [isNeededToSubmit, onSubmit]);

    const handleQuestionSelect = (id: string) => {
        dispatch(selectQuestion(id));
    }

    const showConfirmModal = () => {
        setIsModalOpen(true);
    }

    const handleConfirmSubmit = () => {
        setIsModalOpen(false);
        onSubmit();
    }

    const handleCancelSubmit = () => {
        setIsModalOpen(false);
    }

    return (
        <Card
            style={{
                fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                border: `1.5px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                transition: "all 0.25s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }}
            styles={{
                body: {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%"
                }
            }}
        >
            {/* Header */}
            <div className="p-4 flex-shrink-0">
                <Title
                    level={4}
                    className="mb-0 leading-tight"
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                    }}
                >
                    Question Board
                </Title>
                <Text
                    type="secondary"
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        fontSize: "0.95rem",
                    }}
                >
                    {answeredCount} / {totalQuestions} answered
                </Text>

            </div>

            <Divider style={{ borderColor: borderColor }} />
            {/* Question Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">

                <div className={`grid gap-3 ${isMobile ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    {questions?.map((question, index) => {
                        const isCurrent = index === currentQuestionIndex
                        const isAnswered = answeredList?.find(answer => answer.snapShotQuestionId === question.id);

                        const baseClasses = `aspect-square rounded-sm border-2 font-semibold flex items-center justify-center transition-all duration-150  ${isMobile ? 'text-base' : 'text-sm'
                            }`

                        const stateClasses = isCurrent
                            ? "border-blue-500 bg-blue-500 text-white shadow-md"
                            : isAnswered
                                ? "border-green-500 bg-green-100 text-green-800"
                                : "border-gray-300 bg-white text-gray-900"

                        const disabledClasses = isSubmitting ? "opacity-50" : "";

                        const cursorClass = isSubmitting ? "cursor-not-allowed" : "cursor-pointer";

                        const hoverClasses = isSubmitting ? "" : isAnswered ? "hover:bg-green-200" : "hover:border-blue-400";

                        return (
                            <Tooltip title={`Question ${index + 1}`} key={index}>
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleQuestionSelect(question?.id)}
                                    className={`${baseClasses} ${stateClasses} ${disabledClasses} ${cursorClass} ${hoverClasses} `}
                                >
                                    {index + 1}
                                </button>
                            </Tooltip>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-500" />
                        <p className="text-muted-foreground">Current Question</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-green-500 bg-green-100" />
                        <p className="text-muted-foreground">Answered</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white" />
                        <p className="text-muted-foreground">Unanswered</p>
                    </div>
                </div>
            </div>

            <Divider style={{ borderColor: borderColor }} />
            {/* Footer Stats - Sticky at bottom */}
            <div className=" p-4 space-y-3 flex-shrink-0">
                <div className="text-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground mb-1">Progress</p>
                        <div>
                            <span className="font-semibold">{answeredCount}</span>
                            <span className="text-muted-foreground">/ {totalQuestions}</span>
                        </div>
                    </div>
                    <Progress
                        percent={Number(progressPercentage.toFixed(1))}
                        className="h-1 mt-2"
                    />
                </div>
                <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                        fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                        fontWeight: 600,
                        height: "44px"
                    }}
                    onClick={showConfirmModal}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting Quiz..." : "Submit Quiz"}
                </Button>
            </div>

            {/* Confirmation Modal */}
            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "20px" }} />
                        <span style={{ fontFamily: '"Courier New", monospace', fontWeight: 600 }}>
                            Confirm Quiz Submission
                        </span>
                    </div>
                }
                open={isModalOpen}
                onOk={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                okText="Submit"
                cancelText="Review Again"
                okButtonProps={{
                    style: {
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                    },
                }}
                cancelButtonProps={{
                    style: {
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                    },
                }}
                centered
            >
                <div style={{ 
                    fontFamily: '"Courier New", monospace', 
                    padding: "16px 0",
                    lineHeight: "1.6"
                }}>
                    <p style={{ marginBottom: "12px" }}>
                        You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
                    </p>
                    {answeredCount < totalQuestions && (
                        <p style={{ color: "#faad14", marginBottom: "12px" }}>
                            ⚠️ You have <strong>{totalQuestions - answeredCount}</strong> unanswered question(s).
                        </p>
                    )}
                    <p style={{ marginBottom: "0" }}>
                        Are you sure you want to submit your quiz?
                    </p>
                </div>
            </Modal>
        </Card>
    )
}

export default QuestionBoard