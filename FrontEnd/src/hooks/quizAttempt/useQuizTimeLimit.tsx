import { useState, useCallback } from "react";
import { QuizTimeLimitModal } from "@/components/QuizTimeLimit/QuizTimeLimit";

export function useQuizTimeLimit({ quizId }: { quizId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [onConfirmCallback, setOnConfirmCallback] = useState<
        (() => void) | null
    >(null);

    const openTimeLimitModal = useCallback(
        (callback?: () => void) => {
            if (callback) setOnConfirmCallback(() => callback);
            setIsOpen(true);
        },
        []
    );

    const TimeLimitModal = (
        <QuizTimeLimitModal
            open={isOpen}
            onOpenChange={setIsOpen}
            onConfirm={(time: number) => {
                if (quizId && (time > 0 || time === -1)) {
                    window.localStorage.setItem(quizId, time.toString());
                }
                setIsOpen(false);
                if (onConfirmCallback) {
                    onConfirmCallback();
                    setOnConfirmCallback(null);
                }
            }}
        />
    );

    return { openTimeLimitModal, TimeLimitModal };
}
