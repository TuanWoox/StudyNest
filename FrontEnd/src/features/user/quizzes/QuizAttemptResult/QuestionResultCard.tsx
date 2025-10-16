import { Card, Row, Col, Tag, Typography, Space } from "antd";
import { ChoiceDTO } from "@/types/choice/choiceDTO";
import { QuestionDTO } from "@/types/question/questionDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";

const { Title, Text, Paragraph } = Typography;

interface QuestionResultCardProps {
    question: QuestionDTO;
    answer: QuizAttemptAnswerDTO;
    index: number;
    darkMode: boolean;
}

const QuestionResultCard = ({ question, answer, index, darkMode }: QuestionResultCardProps) => {
    const isCorrect = answer.isCorrect;

    const getUserSelectedChoices = (question: QuestionDTO, answer: QuizAttemptAnswerDTO) => {
        const userChoiceIds = answer.quizAttemptAnswerChoices.map(choice => choice.choiceId);
        return question.choices.filter(choice => userChoiceIds.includes(choice.id));
    };

    const getCorrectChoices = (question: QuestionDTO) =>
        question.choices.filter(choice => choice.isCorrect);

    const getChoicesText = (choices: ChoiceDTO[]) => choices.map(c => c.text).join(", ");

    const userChoices = getUserSelectedChoices(question, answer);
    const correctChoices = getCorrectChoices(question);

    return (
        <Card
            bordered
            hoverable
            className={`shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-[#E2DFE1] text-black'}`}
            style={{ height: "100%" }}
        >
            <Row justify="space-between" align="middle" className="mb-3">
                <Col>
                    <Title level={5} style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>
                        {index}. {question.name}
                    </Title>
                </Col>
                <Col>
                    <Tag color={isCorrect ? "green" : "red"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                    </Tag>
                </Col>
            </Row>

            <Space direction="vertical" size="small" className="w-full">
                <div>
                    <Text type="secondary" className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Your answer: </Text>
                    <Text strong style={{ color: isCorrect ? "#52c41a" : "#f5222d" }}>
                        {userChoices.length > 0 ? getChoicesText(userChoices) : "No answer"}
                    </Text>
                </div>

                {!isCorrect && (
                    <div>
                        <Text type="secondary" className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Correct answer: </Text>
                        <Text strong style={{ color: "#52c41a" }}>
                            {getChoicesText(correctChoices)}
                        </Text>
                    </div>
                )}

                {question.explanation && (
                    <Paragraph
                        className={`mt-2 mb-0 px-3 py-2 rounded-md ${darkMode
                            ? 'bg-blue-900/30 border-l-4 border-blue-500'
                            : 'bg-blue-50 border-l-4 border-blue-500'
                            }`}
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
