import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectQuizProgress } from "@/store/quizAttemptSlice";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Card } from "antd";

function QuizProgress() {
    const { primaryColor, borderColor, shadowColor } = useAntDesignTheme();
    const {
        currentQuestionIndex: current,
        answeredCount,
        progressPercentage: percentage,
        totalQuestions: total,
    } = useReduxSelector(selectQuizProgress);


    return (
        <Card
            bordered
            style={{
                fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                border: `1.5px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                transition: "all 0.25s ease",
                marginBottom: "12px"
            }}
        >
            {/* Header: progress summary */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p
                        style={{
                            fontSize: "1rem",
                            marginBottom: "0.25rem",
                        }}
                    >
                        Question Progress
                    </p>
                    <p
                        style={{
                            fontSize: "1.6rem",
                            fontWeight: 700,
                            margin: 0,
                        }}
                    >
                        {current + 1}{" "}
                        <span
                            style={{
                                fontSize: "1rem",
                                opacity: 0.75,
                            }}
                        >
                            / {total}
                        </span>
                    </p>
                </div>

                <div
                    className="flex items-center gap-2"
                >
                    <CheckCircleOutlined style={{ fontSize: 18 }} />
                    <span style={{ fontWeight: 600 }}>{answeredCount} answered</span>
                </div>
            </div>

            {/* Progress bar retro style */}
            <div
                className="relative w-full h-2 rounded-full overflow-hidden mt-2"
                style={{
                    border: `1px solid ${borderColor}`,
                }}
            >
                <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
                    style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${primaryColor}AA, ${primaryColor})`,
                    }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Quiz progress: ${answeredCount} of ${total} questions answered`}
                />
            </div>

            <p
                className="text-sm text-right mt-1"
                style={{
                    fontFamily: '"Courier New", monospace',
                }}
            >
                {Math.round(percentage)}% complete
            </p>
        </Card>
    );
}

export default QuizProgress;