import { Card, Row, Col, Tag, Typography, Space, theme } from "antd";
import { ChoiceDTO } from "@/types/choice/choiceDTO";
import { QuestionDTO } from "@/types/question/questionDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

const { Title, Text, Paragraph } = Typography;

interface QuestionResultCardProps {
    question: QuestionDTO;
    answer?: QuizAttemptAnswerDTO | null; // <-- explicitly allow null
    index: number;
}

const QuestionResultCard = ({ question, answer, index }: QuestionResultCardProps) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const isCorrect = answer?.isCorrect ?? false;

    // === Safe helper functions ===
    const getUserSelectedChoices = (question: QuestionDTO, answer?: QuizAttemptAnswerDTO | null) => {
        if (!answer?.quizAttemptAnswerChoices) return [];
        const userChoiceIds = answer.quizAttemptAnswerChoices.map((choice) => choice.choiceId);
        return question.choices.filter((choice) => userChoiceIds.includes(choice.id));
    };

    const getCorrectChoices = (question: QuestionDTO) =>
        question.choices.filter((choice) => choice.isCorrect);

    const getChoicesText = (choices: ChoiceDTO[]) => choices.map((c) => c.text).join(", ");

    const userChoices = getUserSelectedChoices(question, answer);
    const correctChoices = getCorrectChoices(question);

    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // ~88% opacity
    const shadowColor = `${primaryColor}55`; // ~33% opacity

    return (
        <Card
            className="transition-all duration-300 ease-out font-mono"
            style={{
                height: "100%",
                border: `1.5px solid ${borderColor}`,
                boxShadow: `3px 3px 0 ${shadowColor}`,
            }}
            styles={{
                body: { padding: "16px 20px" },
            }}
        >
            {/* === Header === */}
            <Row justify="space-between" align="middle" className="mb-3">
                <Col>
                    <Title
                        level={5}
                        style={{
                            margin: 0,
                            fontFamily: "'Courier New', monospace",
                            letterSpacing: "0.2px",
                        }}
                    >
                        {index}. {question.name}
                    </Title>
                </Col>
                <Col>
                    <Tag
                        color={isCorrect ? "green" : "red"}
                        style={{
                            fontWeight: 600,
                            fontFamily: "'IBM Plex Mono', monospace",
                        }}
                    >
                        {isCorrect ? "Correct" : "Incorrect"}
                    </Tag>
                </Col>
            </Row>

            {/* === Content === */}
            <Space direction="vertical" size="small" className="w-full">
                {/* User Answer */}
                <div>
                    <Text
                        type="secondary"
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                        style={{ fontFamily: "'Courier New', monospace" }}
                    >
                        Your answer:{" "}
                    </Text>
                    <Text
                        strong
                        style={{
                            color: isCorrect ? "#52c41a" : "#f5222d",
                            fontFamily: "'Courier New', monospace",
                        }}
                    >
                        {userChoices.length > 0 ? getChoicesText(userChoices) : "No answer"}
                    </Text>
                </div>

                {/* Correct Answer */}
                {!isCorrect && (
                    <div>
                        <Text
                            type="secondary"
                            className={darkMode ? "text-gray-400" : "text-gray-600"}
                            style={{ fontFamily: "'Courier New', monospace" }}
                        >
                            Correct answer:{" "}
                        </Text>
                        <Text
                            strong
                            style={{
                                color: "#52c41a",
                                fontFamily: "'Courier New', monospace",
                            }}
                        >
                            {getChoicesText(correctChoices)}
                        </Text>
                    </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                    <Paragraph
                        className={`mt-3 mb-0 px-3 py-2 border-l-4 ${darkMode ? "bg-blue-900/30 border-blue-500" : "bg-blue-50 border-blue-500"
                            }`}
                        style={{
                            fontFamily: "'Courier New', monospace",
                            lineHeight: 1.5,
                        }}
                    >
                        <Text strong>Explanation: </Text>
                        {question.explanation}
                    </Paragraph>
                )}
            </Space>
        </Card>
    );
};

export default QuestionResultCard;
