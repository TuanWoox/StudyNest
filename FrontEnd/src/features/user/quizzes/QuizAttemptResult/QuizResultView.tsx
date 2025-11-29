import useGetOneQuizAttemptById from "@/hooks/quizAttempt/useGetOneQuizAttemptById";
import { useParams } from "react-router-dom";
import ResultHeader from "./components/ResultHeader";
import QuestionResultsList from "./components/QuestionResultsList";
import QuizContentViewSkeleton from "@/components/QuizContentViewSkeleton/QuizContentViewSkeleton";
import { useLocation } from "react-router-dom";

const QuizResultView = () => {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useGetOneQuizAttemptById(id);

    const location = useLocation();
    const fromHistory = location.state?.fromHistory === true;

    if (isLoading) {
        return <QuizContentViewSkeleton />;
    }

    const totalQuestions = data?.quizAttemptSnapshot.quizQuestionsParsed?.length ?? 0;
    const correctAnswers = data?.quizAttemptAnswers?.filter(x => x?.isCorrect)?.length ?? 0;

    return (
        <div
            className="w-full mx-auto p-8 overflow-y-auto"
            style={{
                scrollbarWidth: "none",
            }}
        >
            <ResultHeader
                score={data?.score}
                id={data?.quizAttemptSnapshot.quizId}
                totalQuestions={totalQuestions}
                correctAnswers={correctAnswers}
            />
            <QuestionResultsList
                answers={data?.quizAttemptAnswers}
                questions={data?.quizAttemptSnapshot.quizQuestionsParsed}
                quizId={data?.quizAttemptSnapshot.quizId}
                fromHistory={fromHistory}
            />
        </div>
    );
};

export default QuizResultView;
