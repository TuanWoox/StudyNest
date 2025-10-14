import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { Typography, Space, Divider } from "antd";
import { useParams } from "react-router-dom";
import { FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function QuizHeader() {
    const { id } = useParams<{ id: string }>();
    const { data } = useGetQuizDetail(id);

    return (
        <div className="mb-2">
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
}