import { useGetOneForAttempting } from "@/hooks/quizAttemptSnapshotHook/useGetOneForAttempting";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { initState, nextQuestion, previousQuestion, selectQuizAttempt } from "@/store/quizAttemptSlice";
import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import { QuizHeader } from "./QuizHeader";
import { QuizProgress } from "./QuizProgress";
import { QuizNavigation } from "./QuizNavigation";
import { useSubmitQuizAttempt } from "@/hooks/quizAttempt/useSubmitQuizAttempt";
import Spinner from "@/components/Spinner/Spinner";
import QuizSnapshotNotReady from "./QuizSnapshotNotReady";
import { useQuizAttemptSnapshotHub } from "@/context/QuizSnapshotHubContext/QuizAttemptSnapshotHubContextValue";

const QuizView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading, refetch: refreshQuizAttempt } = useGetOneForAttempting(id || "", { enabled: !!id });
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    const dispatch = useReduxDispatch();
    const { submitAnswer, isLoading: isSubmitting } = useSubmitQuizAttempt();
    const { notificationConnection } = useQuizAttemptSnapshotHub();
    const darkMode = useOutletContext<boolean>();

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
        if (id !== quizAttempt.quizId || JSON.stringify(data) !== quizAttempt.quizAttemptSnapshot) {
            dispatch(
                initState({
                    quizId: id as string,
                    quizAttemptSnapshot: JSON.stringify(data),
                    createQuizAttemptAnswerList: [],
                    questionId: data?.quizQuestionsParsed?.[0]?.id ?? "",
                })
            );
        }

        // Subscribe to reload notifications
        const handleReload = ({ quizId }: { quizId: string }) => {
            if (id === quizId) refreshQuizAttempt();
        };

        notificationConnection?.on("ReloadQuizAttemptSnapshot", handleReload);

        return () => {
            notificationConnection?.off("ReloadQuizAttemptSnapshot", handleReload);
        };
    }, [data, id, dispatch, quizAttempt.quizAttemptSnapshot, quizAttempt.quizId, notificationConnection, refreshQuizAttempt]);

    if (isLoading) return <Spinner />;

    if (!data)
        return (
            <div className="w-full lg:max-w-9/10 mx-auto p-4">
                <QuizSnapshotNotReady />
            </div>
        );

    return (
        <div
            className={`w-full ${darkMode ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"}`}
        >
            <div
                className="w-full lg:max-w-5xl mx-auto p-4 overflow-y-auto"
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
        </div>
    );
};

export default QuizView;
