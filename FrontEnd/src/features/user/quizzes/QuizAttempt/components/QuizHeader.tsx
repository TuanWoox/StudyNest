import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { Typography, Space, Button, theme, Card } from "antd";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";

const { Title, Text } = Typography;

export const QuizHeader: React.FC = () => {
    const { token } = theme.useToken();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data } = useGetQuizDetail(id);
    // const darkMode = useOutletContext<boolean>();

    const onClickBackToQuizList = () => {
        navigate(`/user/quiz/${id}`);
    };

    // Tone màu retro
    const primaryColor = token.colorPrimary;
    const borderColor = `${primaryColor}E0`; // 88% opacity
    const shadowColor = `${primaryColor}55`; // 33% opacity

    return (
        <Card
            style={{
                fontFamily: '"Courier New", "IBM Plex Mono", monospace',
                border: `1.5px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                transition: "all 0.25s ease",
                marginBottom: "12px"
            }}
        >
            {/* Back Button */}
            <div className="flex items-center justify-start mb-3">
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={onClickBackToQuizList}
                    style={{
                        fontWeight: 600,
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                        fontFamily: '"Courier New", monospace',
                        borderRadius: 0,
                    }}
                >
                    Back to Quiz
                </Button>
            </div>

            {/* Quiz Title & Description */}
            <div className="mx-auto text-center">
                <Space direction="vertical" size="small" className="w-full">
                    <FileTextOutlined
                        className="text-4xl"
                        style={{
                            color: primaryColor,
                            opacity: 0.9,
                        }}
                    />

                    <Title
                        level={3}
                        className="!mb-1"
                        style={{
                            fontFamily: '"Courier New", monospace',
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                        }}
                    >
                        {data?.title}
                    </Title>

                    <Text
                        type="secondary"
                        className="text-sm"
                        style={{
                            fontFamily: '"Courier New", monospace',
                        }}
                    >
                        Please read each question carefully and select your answer
                    </Text>
                </Space>
            </div>
        </Card>
    );
};
