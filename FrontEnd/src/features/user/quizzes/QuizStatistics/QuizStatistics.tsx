import StudynestModal from "@/components/StudyNestModal/StudynestModal";
import useGetOneStatisticsByQuizId from "@/hooks/quizStatisticsHook/useGetOneStatisticsByQuizId";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import QuizStatisticsHeader from "./components/QuizStatisticsHeader";
import QuizStatisticsSummary from "./components/QuizStatisticsSummary";
import QuizStatisticsChart from "./components/QuizStatisticsChart";
import QuizTopMistakes from "./components/QuizTopMistakes";
import { useAntDesignTheme } from "@/hooks/common";
import { ModalProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import SpinnerFull from "@/components/SpinnerFull/SpinnerFull";
import { EmptyState } from "@/components/EmptyState/EmptyState";

interface QuizStatisticsProps {
    quizId: string;
}

export interface QuizStatisticsRef {
    handleOpenStats: () => void;
}

const QuizStatistics = forwardRef<QuizStatisticsRef, QuizStatisticsProps>(
    ({ quizId }, ref) => {
        const [dateFilter, setDateFilter] = useState<[Dayjs | null, Dayjs | null]>([
            dayjs().subtract(7, "day"),
            dayjs(),
        ]);

        const { data, isLoading } = useGetOneStatisticsByQuizId(quizId, dateFilter);
        const [isOpen, setIsOpen] = useState<boolean>(false);
        const { modalStyles } = useAntDesignTheme();

        const customModalStyles: ModalProps["styles"] = {
            ...modalStyles,
            body: {
                ...modalStyles.body,
                overflowY: "auto",
                overflowX: "hidden",
            },
        };

        useImperativeHandle(ref, () => ({
            handleOpenStats() {
                setIsOpen(true);
            },
        }));

        useEffect(() => {
            if (isOpen) {
                setDateFilter([dayjs().subtract(7, "day"), dayjs()]);
            }
        }, [isOpen]);

        return (
            <StudynestModal
                visible={isOpen}
                onClose={() => setIsOpen(false)}
                cancelText="Close"
                customStyles={customModalStyles}
                width="95%"
            >
                <div className="m-4 space-y-4">
                    {/* Ant Design Title + Subtitle */}
                    <QuizStatisticsHeader
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                    />

                    {/* Show spinner while loading */}
                    {isLoading ? (
                        <SpinnerFull />
                    ) : data?.result?.attemptSummary?.totalAttempts === 0 ? (
                        <EmptyState
                            type="info"
                            title="Your Quiz Journey Awaits!"
                            description="You haven't taken this quiz yet. Start your first attempt now and track your progress!"
                        />
                    ) : (
                        <>
                            {/* Statistics Grid */}
                            <QuizStatisticsSummary data={data} />
                            {/* Chart Section */}
                            <QuizStatisticsChart data={data} />
                            {/* Top Mistakes Question */}
                            <QuizTopMistakes data={data} />
                        </>
                    )}
                </div>
            </StudynestModal>
        );
    }
);

QuizStatistics.displayName = "QuizStatistics";
export default QuizStatistics;
