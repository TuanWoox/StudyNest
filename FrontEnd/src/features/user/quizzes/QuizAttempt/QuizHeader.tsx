import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { Typography, Space, Divider, Button } from "antd";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const QuizHeader: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data } = useGetQuizDetail(id);
    const darkMode = useOutletContext<boolean>();

    const onClickBackToQuizList = () => {
        navigate(`/user/quiz/${id}`);
    };

    return (
        <div className="mb-4">
            {/* Back Button */}
            <div className="flex items-center justify-start mb-2">
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={onClickBackToQuizList}
                    style={{
                        backgroundColor: darkMode ? "#1f2937" : undefined,
                        borderColor: darkMode ? "#1f2937" : undefined,
                        color: darkMode ? "#ffffff" : undefined,
                    }}
                >
                    Back to Quiz
                </Button>
            </div>

            {/* Quiz Title & Description */}
            <div className="mx-auto text-center">
                <Space direction="vertical" size="small" className="w-full">
                    <FileTextOutlined className="text-4xl text-blue-500" />

                    <Title level={3} className="!mb-1">
                        {data?.title}
                    </Title>

                    <Text type="secondary" className="text-sm">
                        Please read each question carefully and select your answer
                    </Text>
                </Space>
            </div>

            <Divider className="!mt-2 !mb-4" />
        </div>
    );
};
