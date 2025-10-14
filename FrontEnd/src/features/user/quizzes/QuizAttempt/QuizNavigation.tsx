import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector"
import { selectQuizNavigation } from "@/store/quizAttemptSlice"
import { LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons"
import { Button, Grid } from "antd"

interface QuizNavigationProps {
    onPrevious: () => void
    onNext: () => void
    onSubmit: () => void
    isSubmitting: boolean
}

const { useBreakpoint } = Grid

export function QuizNavigation({
    onPrevious,
    onNext,
    onSubmit,
    isSubmitting,
}: QuizNavigationProps) {
    const { isLastQuestion, isFirstQuestion, hasAnswer } = useReduxSelector(selectQuizNavigation);
    const screens = useBreakpoint();

    // responsive size: small nếu mobile, còn lại middle
    const buttonSize = screens.xs ? "small" : "middle"

    return (
        <div className="flex items-center justify-between gap-4">
            <Button
                onClick={onPrevious}
                disabled={isFirstQuestion || isSubmitting}
                type="default"
                size={buttonSize}
                icon={<LeftOutlined />}
            >
                Prev
            </Button>

            <div className="flex-1 flex justify-center">
                {!hasAnswer && (
                    <p className="text-sm text-muted-foreground italic">
                        Select an answer to continue
                    </p>
                )}
            </div>

            {isLastQuestion ? (
                <Button
                    onClick={onSubmit}
                    disabled={!hasAnswer || isSubmitting}
                    type="primary"
                    size={buttonSize}
                    icon={<SendOutlined />}
                    loading={isSubmitting}
                >
                    Submit Quiz
                </Button>
            ) : (
                <Button
                    onClick={onNext}
                    disabled={!hasAnswer || isSubmitting}
                    type="primary"
                    size={buttonSize}
                    icon={<RightOutlined />}
                >
                    Next
                </Button>
            )}
        </div>
    )
}
