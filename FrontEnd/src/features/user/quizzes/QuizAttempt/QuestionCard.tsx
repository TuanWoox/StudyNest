import Spinner from "@/components/Spinner/Spinner";
import MultipleChoiceQuestion from "./QuestionType/MultipleChoiceQuestion";
import MultipleSelectQuestion from "./QuestionType/MultipleSelectQuestion";
import TrueFalseQuestion from "./QuestionType/TrueFalseQuestion";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectQuizCard } from "@/store/quizAttemptSlice";



const QuestionCard = () => {

    const { currentQuestion: question, currentAnswer: answer } = useReduxSelector(selectQuizCard);

    if (!question) return <Spinner></Spinner>
    return (
        <div className="bg-surface-elevated rounded-2xl p-6 border border-slate-300 shadow-lg mb-4">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <QuestionTypeBadge type={question.type.toLowerCase()} />
                    </div>
                    <h2 className="sm:text-base md:text-lg lg:text-2xl text-base font-bold text-foreground mb-2 text-balance">{question.name}</h2>
                </div>
            </div>
            {question.type.toLowerCase() === "mcq" && (
                <MultipleChoiceQuestion question={question} answer={answer} />
            )}
            {question.type.toLowerCase() === "msq" && (
                <MultipleSelectQuestion question={question} answer={answer} />
            )}
            {question.type.toLowerCase() === "tf" && (
                <TrueFalseQuestion question={question} answer={answer} />
            )}
        </div>
    );
};

export default QuestionCard;
