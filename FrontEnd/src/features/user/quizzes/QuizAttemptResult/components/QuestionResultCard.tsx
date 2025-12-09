import {
    Card,
    Row,
    Col,
    Tag,
    Typography,
    Space,
    theme,
    Image,
    Collapse,
    Radio,
    Checkbox,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { QuestionDTO } from "@/types/question/questionDTO";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

const { Title, Text, Paragraph } = Typography;

interface QuestionResultCardProps {
    question: QuestionDTO;
    answer?: QuizAttemptAnswerDTO | null;
    index: number;
}

const QuestionResultCard = ({ question, answer, index }: QuestionResultCardProps) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const isCorrect = answer?.isCorrect ?? false;

    // List of selected choices (Multi-select compatible)
    const userChoiceIds =
        answer?.quizAttemptAnswerChoices?.map((c) => c.choiceId) ?? [];

    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // ~88% opacity
    const shadowColor = `${primaryColor}55`; // ~33% opacity

    const isMultiSelect = question.type === "MSQ";

    return (
        <Card
            className="transition-all duration-300 ease-out font-mono"
            style={{
                border: `1.5px solid ${borderColor}`,
                boxShadow: `3px 3px 0 ${shadowColor}`,
            }}
            styles={{ body: { padding: "16px 20px" } }}
        >
            {/* Header */}
            <Row justify="space-between" align="middle" className="mb-3">
                <Col>
                    <Title level={5} style={{ margin: 0 }}>
                        {index}. {question.name}
                    </Title>
                </Col>
                <Col>
                    <Tag color={isCorrect ? "green" : "red"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                    </Tag>
                </Col>
            </Row>

            {/* Image */}
            {question.imageUrl && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        display: "flex",
                        justifyContent: "center",
                        background: darkMode ? "#1f1f1f" : "#fafafa",
                        border: `1px solid ${darkMode ? "#434343" : "#d9d9d9"}`,
                        borderRadius: 4,
                    }}
                >
                    <Image
                        src={question.imageUrl}
                        alt="image"
                        style={{ maxWidth: "100%", maxHeight: 300 }}
                    />
                </div>
            )}

            {/* Answer List */}
            <div style={{ width: "100%" }}>
                {isMultiSelect ? (
                    // Multi-select => Checkbox
                    <Checkbox.Group value={userChoiceIds} style={{ width: "100%" }}>
                        <Space direction="vertical" size="small" className="w-full">
                            {question.choices.map((choice, idx) => {
                                const isCorrectChoice = choice.isCorrect;
                                const isSelected = userChoiceIds.includes(choice.id);

                                return (
                                    <div
                                        key={choice.id}
                                        style={{
                                            padding: "10px 14px",
                                            border: "1px solid",
                                            borderColor: isCorrectChoice
                                                ? "#52c41a"
                                                : isSelected
                                                    ? "#f5222d"
                                                    : darkMode
                                                        ? "#434343"
                                                        : "#d9d9d9",
                                            backgroundColor: isCorrectChoice
                                                ? "#52c41a20"
                                                : isSelected
                                                    ? "#f5222d20"
                                                    : darkMode
                                                        ? "#141414"
                                                        : "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14,
                                        }}
                                    >
                                        <Checkbox value={choice.id} disabled />

                                        <Text strong>{String.fromCharCode(65 + idx)}</Text>
                                        <Text>{choice.text}</Text>

                                        <span style={{ marginLeft: "auto" }}>
                                            {isCorrectChoice && (
                                                <CheckOutlined style={{ color: "#52c41a" }} />
                                            )}
                                            {!isCorrectChoice && isSelected && (
                                                <CloseOutlined style={{ color: "#f5222d" }} />
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </Space>
                    </Checkbox.Group>
                ) : (
                    // Single-select => Radio
                    <Radio.Group value={userChoiceIds[0] ?? null} style={{ width: "100%" }}>
                        <Space direction="vertical" size="small" className="w-full">
                            {question.choices.map((choice, idx) => {
                                const isCorrectChoice = choice.isCorrect;
                                const isSelected = userChoiceIds.some(id => String(id) === String(choice.id));

                                return (
                                    <div
                                        key={choice.id}
                                        style={{
                                            padding: "10px 14px",
                                            border: "1px solid",
                                            borderColor: isCorrectChoice
                                                ? "#52c41a"
                                                : isSelected
                                                    ? "#f5222d"
                                                    : darkMode
                                                        ? "#434343"
                                                        : "#d9d9d9",
                                            backgroundColor: isCorrectChoice
                                                ? "#52c41a20"
                                                : isSelected
                                                    ? "#f5222d20"
                                                    : darkMode
                                                        ? "#141414"
                                                        : "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14,
                                        }}
                                    >
                                        <Radio value={choice.id} disabled style={{ marginRight: 0, marginInlineStart: 0 }} />

                                        <Text strong>{String.fromCharCode(65 + idx)}</Text>
                                        <Text>{choice.text}</Text>

                                        <span style={{ marginLeft: "auto" }}>
                                            {isCorrectChoice ? (
                                                <CheckOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                                            ) : isSelected ? (
                                                <CloseOutlined style={{ color: "#f5222d", fontSize: 16 }} />
                                            ) : null}
                                        </span>
                                    </div>
                                );
                            })}
                        </Space>
                    </Radio.Group>
                )}
            </div>

            {/* Explanation Collapse */}
            {question.explanation && (
                <Collapse
                    style={{
                        marginTop: "20px",
                        border: `1.5px solid ${borderColor}`,
                    }}
                    items={[
                        {
                            key: "1",
                            label: <Text strong italic>Explanation</Text>,
                            children: (
                                <Paragraph style={{ marginBottom: 0 }}>
                                    {question.explanation}
                                </Paragraph>
                            ),
                        },
                    ]}
                />
            )}
        </Card>
    );
};

export default QuestionResultCard;