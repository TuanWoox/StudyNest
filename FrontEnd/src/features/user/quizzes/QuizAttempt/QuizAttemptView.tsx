import { useGetOneForAttempting } from "@/hooks/quizAttemptSnapshotHook/useGetOneForAttempting";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { initState, nextQuestion, previousQuestion, selectQuizAttempt } from "@/store/quizAttemptSlice";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import QuestionCard from "./components/QuestionCard";
import { QuizHeader } from "./components/QuizHeader";
import { QuizProgress } from "./components/QuizProgress";
import { QuizNavigation } from "./components/QuizNavigation";
import { useSubmitQuizAttempt } from "@/hooks/quizAttempt/useSubmitQuizAttempt";
import Spinner from "@/components/Spinner/Spinner";
import QuizSnapshotNotReady from "./components/QuizSnapshotNotReady";
import { useQuizAttemptSnapshotHub } from "@/context/QuizSnapshotHubContext/QuizAttemptSnapshotHubContextValue";
import { ErrorDisplay } from "@/components/ErrorDisplay/ErrorDisplay";

const QuizView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: resultQuizSnapshot,
        isLoading: isQuizSnapshotLoading,
        isRefetching: isQuizSnapshotRefetching,
        refetch: refreshToLoadQuizSnapshot,
        error: quizSnapshotError } = useGetOneForAttempting(id, { enabled: true });
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    const dispatch = useReduxDispatch();
    const { submitAnswer, isLoading: isSubmitting } = useSubmitQuizAttempt();
    const { notificationConnection } = useQuizAttemptSnapshotHub();
    const quizSnapshotLoading = useMemo(() => isQuizSnapshotLoading || isQuizSnapshotRefetching, [isQuizSnapshotLoading, isQuizSnapshotRefetching]);

    const onPrevious = () => dispatch(previousQuestion());
    const onNext = () => dispatch(nextQuestion());
    const onSubmit = () => {
        submitAnswer({
            quizId: quizAttempt.quizId,
            submittedAnswer: quizAttempt.createQuizAttemptAnswerList,
        });
    };

    useEffect(() => {
        // Initialize quiz attempt if needed
        if (id !== quizAttempt.quizId || JSON.stringify(resultQuizSnapshot?.result) !== quizAttempt.quizAttemptSnapshot) {
            dispatch(
                initState({
                    quizId: id as string,
                    quizAttemptSnapshot: JSON.stringify(resultQuizSnapshot?.result),
                    createQuizAttemptAnswerList: [],
                    questionId: resultQuizSnapshot?.result?.quizQuestionsParsed?.[0]?.id ?? "",
                })
            );
        }

        // Subscribe to reload notifications
        const handleReload = ({ quizId }: { quizId: string }) => {
            if (id === quizId) refreshToLoadQuizSnapshot();
        };

        notificationConnection?.on("ReloadQuizAttemptSnapshot", handleReload);

        return () => {
            notificationConnection?.off("ReloadQuizAttemptSnapshot", handleReload);
        };
    }, [id, resultQuizSnapshot?.result, quizAttempt.quizId, quizAttempt.quizAttemptSnapshot, notificationConnection, dispatch, refreshToLoadQuizSnapshot]);

    if (quizSnapshotLoading) return <Spinner />;

    if (!resultQuizSnapshot?.result && !resultQuizSnapshot?.message)
        return (
            <div className="w-full lg:max-w-9/10 mx-auto p-4">
                <QuizSnapshotNotReady />
            </div>
        );

    if (resultQuizSnapshot.message || quizSnapshotError) {
        return (
            <div className="w-full lg:max-w-5xl mx-auto p-4">
                <ErrorDisplay
                    title="Unable to load quiz"
                    message={resultQuizSnapshot.message || quizSnapshotError?.message || "An unexpected error occurred while fetching quiz data."}
                />
            </div>
        );
    }

    return (
        <div
            className={`w-full lg:max-w-5xl mx-auto p-4 overflow-y-auto`}
            style={{ scrollbarWidth: "none" }}
        >
            <QuizHeader />
            <QuizProgress />
            <QuestionCard />
            <QuizNavigation
                onPrevious={onPrevious}
                onNext={onNext}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default QuizView;
