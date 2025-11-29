import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Drawer } from "antd";

import { useGetOneForAttempting } from "@/hooks/quizAttemptSnapshotHook/useGetOneForAttempting";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { initState, selectQuizAttempt } from "@/store/quizAttemptSlice";

import ErrorDisplay from "@/components/ErrorDisplay/ErrorDisplay";
import QuizSnapshotNotReady from "./components/QuizSnapshotNotReady";
import QuizContentViewSkeleton from "@/components/QuizContentViewSkeleton/QuizContentViewSkeleton";
import QuizProgress from "./components/QuizProgress";
import QuestionCard from "./components/QuestionCard";
import QuizNavigation from "./components/QuizNavigation";
import QuizHeader from "./components/QuizHeader";
import QuestionBoard from "./components/QuestionBoard";
import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import useIsMobile from "@/hooks/common/useIsMobile";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { useSubmitQuizAttempt } from "@/hooks/quizAttempt/useSubmitQuizAttempt";
import { useQuizAttemptSnapshotHub } from "@/context/QuizSnapshotHubProvider/QuizAttemptSnapshotHubContextValue";

const QuizView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useReduxDispatch();
    const { notificationConnection } = useQuizAttemptSnapshotHub();
    const {
        data: resultQuizSnapshot,
        isLoading,
        isRefetching,
        refetch,
        error,
    } = useGetOneForAttempting(id, { enabled: false });
    const quizSnapshotLoading = useMemo(
        () => isLoading || isRefetching,
        [isLoading, isRefetching]
    );
    const { borderColor } = useAntDesignTheme();
    const { isMobile } = useIsMobile();
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    const { submitAnswer, isLoading: isSubmitting } = useSubmitQuizAttempt();
    const [isBoardViewOpen, setIsBoardViewOpen] = useState<boolean>(true);
    const onSubmit = useCallback(() => {
        submitAnswer({
            quizAttemptSnapshotId: quizAttempt.quizAttemptSnapshotId,
            submittedAnswer: quizAttempt.createQuizAttemptAnswerList,
        });
    }, [submitAnswer, quizAttempt.quizAttemptSnapshotId, quizAttempt.createQuizAttemptAnswerList]);
    const location = useLocation();

    // Close board view on mobile, open on desktop
    useEffect(() => {
        setIsBoardViewOpen(!isMobile);
    }, [isMobile]);

    // Fetch quiz snapshot on mount
    useEffect(() => {
        refetch();
    }, [refetch]);

    // Initialize quiz state
    useEffect(() => {
        if (!resultQuizSnapshot?.result) return;

        dispatch(
            initState({
                quizAttemptSnapshotId: resultQuizSnapshot.result.id,
                quizAttemptSnapshot: JSON.stringify(resultQuizSnapshot?.result),
                createQuizAttemptAnswerList: [],
                questionId:
                    resultQuizSnapshot?.result?.quizQuestionsParsed?.[0]?.id ?? "",
                isNeededToSubmit: false,
            })
        );
    }, [id, resultQuizSnapshot?.result, dispatch]);

    // SignalR: reload snapshot when triggered
    useEffect(() => {
        const handleReload = ({ quizId }: { quizId: string }) => {
            if (id === quizId) refetch();
        };
        notificationConnection?.on("ReloadQuizAttemptSnapshot", handleReload);
        return () => {
            notificationConnection?.off("ReloadQuizAttemptSnapshot", handleReload);
        };
    }, [id, notificationConnection, refetch]);


    if (quizSnapshotLoading) return <QuizContentViewSkeleton />;
    if (!resultQuizSnapshot?.result && !resultQuizSnapshot?.message)
        return <QuizSnapshotNotReady />;
    if (resultQuizSnapshot.message || error)
        return (
            <ErrorDisplay
                title="Unable to load quiz"
                message={
                    resultQuizSnapshot.message ||
                    error?.message ||
                    "An unexpected error occurred while fetching quiz data."
                }
            />
        );

    return (
        <div className="w-full mx-auto p-4 mb-2 overflow-y-auto no-scrollbar">

            {/* Sequential view => Center the question card and max width is 5xl */}
            <div
                className={`flex flex-row gap-3 h-full 
                ${isBoardViewOpen ? "" : "justify-center"} 
                ${isMobile ? "overflow-y-auto no-scrollbar" : ""}`}
            >
                {/* Main content */}
                <div className={`${isBoardViewOpen && !isMobile ? "flex-1" : "w-full max-w-5xl"} `}>
                    <QuizHeader
                        isBoardViewOpen={isBoardViewOpen}
                        toggleBoardView={() => setIsBoardViewOpen((prev) => !prev)}
                        backTo={location?.state?.from || ""}
                    />

                    {!isBoardViewOpen && !isMobile && <QuizProgress />}
                    <QuestionCard />
                    <QuizNavigation
                        isSubmitting={isSubmitting}
                        onSubmit={onSubmit}
                    />
                </div>

                {/* Desktop: Question Board Sidebar */}
                {isBoardViewOpen && !isMobile && (
                    <div className="w-80 flex-shrink-0">
                        <QuestionBoard
                            isSubmitting={isSubmitting}
                            onSubmit={onSubmit}
                        />
                    </div>
                )}
            </div>

            {/* Mobile: Question Board Drawer */}
            <Drawer
                title="Question Board"
                placement="right"
                onClose={() => setIsBoardViewOpen(false)}
                open={isBoardViewOpen && isMobile}
                width="90%"
                styles={{
                    header: {
                        fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                        borderBottom: `1.5px solid ${borderColor}`,
                    },
                    body: { padding: 0 },
                }}
            >
                <QuestionBoard
                    isSubmitting={isSubmitting}
                    onSubmit={onSubmit}
                />
            </Drawer>
        </div>
    );
};

export default QuizView;
