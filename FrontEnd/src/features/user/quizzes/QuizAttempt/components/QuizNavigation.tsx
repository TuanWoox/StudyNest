import useAntDesignTheme from "@/hooks/common/useAntDesignTheme"
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch"
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector"
import { nextQuestion, previousQuestion, selectIsNeededToSubmitQuiz, selectQuizNavigation } from "@/store/quizAttemptSlice"
import { LeftOutlined, RightOutlined, SendOutlined } from "@ant-design/icons"
import { Button, Grid } from "antd"
import React, { useEffect } from "react"

const { useBreakpoint } = Grid

interface QuizNavigationProps {
    isSubmitting: boolean,
    onSubmit: () => void;
}

const QuizNavigation: React.FC<QuizNavigationProps> = ({ isSubmitting, onSubmit }) => {
    const { shadowColor, borderColor } = useAntDesignTheme();
    const dispatch = useReduxDispatch();
    const { isLastQuestion, isFirstQuestion } = useReduxSelector(selectQuizNavigation);
    const isNeededToSubmit = useReduxSelector(selectIsNeededToSubmitQuiz);
    const screens = useBreakpoint();

    // responsive size: small if mobile, otherwise middle
    const buttonSize = screens.xs ? "small" : "middle"

    const onPrevious = () => dispatch(previousQuestion());
    const onNext = () => dispatch(nextQuestion());

    useEffect(() => {
        if (isNeededToSubmit) {
            onSubmit();
        }
    }, [isNeededToSubmit, onSubmit]);

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

            {isLastQuestion ? (
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    type="default"
                    size={buttonSize}
                    icon={<SendOutlined />}
                    loading={isSubmitting}
                    style={{
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    {isSubmitting ? "Submitting Quiz..." : "Submit Quiz"}
                </Button>
            ) : (
                <Button
                    onClick={onNext}
                    disabled={isSubmitting}
                    type="default"
                    size={buttonSize}
                    icon={<RightOutlined />}
                    style={{
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    {isSubmitting ? "Submitting Quiz..." : "Next"}
                </Button>
            )}
        </div>
    )
}

export default QuizNavigation;