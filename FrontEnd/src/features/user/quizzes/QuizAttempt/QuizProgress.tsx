import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectQuizProgress } from "@/store/quizAttemptSlice";
import { CheckCircleOutlined } from "@ant-design/icons";


export function QuizProgress() {
    const { currentQuestionIndex: current, answeredCount: answeredCount,
        progressPercentage: percentage, totalQuestions: total } = useReduxSelector(selectQuizProgress)
    return (
        <div className="mb-4 bg-surface-elevated rounded-xl p-4 border border-border shadow-md border-slate-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Question Progress</p>
                    <p className="text-2xl font-bold text-foreground">
                        {current + 1} <span className="text-muted-foreground text-lg">/ {total}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                    <CheckCircleOutlined className="w-5 h-5" />
                    <span className="font-semibold">{answeredCount} answered</span>
                </div>
            </div>

            <div className="relative w-full h-2 bg-surface rounded-full overflow-hidden mt-1">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-300 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Quiz progress: ${answeredCount} of ${total} questions answered`}
                />
            </div>

            <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(percentage)}% complete</p>
        </div>
    );
}
