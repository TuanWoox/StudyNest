import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector"
import { selectQuizNavigation } from "@/store/quizAttemptSlice"
import { LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons"
import { Button, Grid, theme } from "antd"

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
    const { token } = theme.useToken();
    const { isLastQuestion, isFirstQuestion, hasAnswer } = useReduxSelector(selectQuizNavigation);
    const screens = useBreakpoint();

    // responsive size: small nếu mobile, còn lại middle
    const buttonSize = screens.xs ? "small" : "middle"

    // 🎨 Tông màu LearnHub Retro
    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88% opacity
    const shadowColor = `${primaryColor}55`; // 33% opacity

    return (
        <div className="flex items-center justify-between gap-4">
            <Button
                onClick={onPrevious}
                disabled={isFirstQuestion || isSubmitting}
                type="default"
                size={buttonSize}
                icon={<LeftOutlined />}
                style={{
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    border: `1px solid ${borderColor}`,
                }}
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
                    type="default"
                    size={buttonSize}
                    icon={<SendOutlined />}
                    loading={isSubmitting}
                    style={{
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    Submit Quiz
                </Button>
            ) : (
                <Button
                    onClick={onNext}
                    disabled={!hasAnswer || isSubmitting}
                    type="default"
                    size={buttonSize}
                    icon={<RightOutlined />}
                    style={{
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    Next
                </Button>
            )}
        </div>
    )
}
