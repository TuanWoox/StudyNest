import useGetQuizDetail from "@/hooks/quizHook/useGetQuizDetail";
import { Typography, Space, Button, Card } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { FileTextOutlined, ArrowLeftOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import QuizTimerCount from "./QuizCountDownTimer";
import ModalConfirm from "@/components/ModalConfirm/ModalConfirm";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectQuizProgress } from "@/store/quizAttemptSlice";
import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import useIsMobile from "@/hooks/common/useIsMobile";

const { Title, Text } = Typography;

interface QuizHeaderProps {
    isBoardViewOpen: boolean,
    toggleBoardView: () => void;
    backTo: string;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ isBoardViewOpen, toggleBoardView, backTo }) => {
    const { primaryColor, borderColor, shadowColor } = useAntDesignTheme()
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data } = useGetQuizDetail(id);
    const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);
    const { answeredCount } = useReduxSelector(selectQuizProgress);
    const { isMobile } = useIsMobile();

    const onClickBack = () => {
        if (answeredCount) {
            setIsModalConfirmOpen(true);
        } else {
            if (id) window.localStorage.removeItem(id);
            if (backTo) {
                navigate(backTo);
            } else navigate(`/user/quiz/${id}`);
        }
    };

    const buttonSize = isMobile ? "small" : "middle"

    return (
        <>

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
                <div className="flex items-center justify-between mb-3">
                    <Button
                        type="default"
                        size={buttonSize}
                        icon={<ArrowLeftOutlined />}
                        onClick={onClickBack}
                        style={{
                            fontWeight: 600,
                            boxShadow: `3px 3px 0 ${shadowColor}`,
                            border: `1px solid ${borderColor}`,
                            fontFamily: '"Courier New", monospace',
                            borderRadius: 0,
                        }}
                    >
                        Back to {backTo ? "Quizzes" : "Quiz"}
                    </Button>

                    <Button
                        type="default"
                        size={buttonSize}
                        icon={isBoardViewOpen ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                        onClick={toggleBoardView}
                        style={{
                            fontWeight: 600,
                            boxShadow: `3px 3px 0 ${shadowColor}`,
                            border: `1px solid ${borderColor}`,
                            fontFamily: '"Courier New", monospace',
                            borderRadius: 0,
                        }}
                    >
                        {isBoardViewOpen ? "Sequential View" : "Board View"}
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
                    <QuizTimerCount />
                </div>
            </Card>

            <ModalConfirm
                open={isModalConfirmOpen}
                title="Confirm Back To Quiz"
                content={
                    <>
                        Are you sure you want to go back to the quiz?
                        <br />
                        Your current attempt will be <b style={{ color: "#DC2626" }}>discarded</b>.
                    </>
                }
                cancelText="Cancel"
                danger
                onOk={() => {
                    if (id) window.localStorage.removeItem(id);
                    navigate(`/user/quiz/${id}`);
                }}
                onCancel={() => setIsModalConfirmOpen(false)}
            />
        </>
    );
};

export default QuizHeader;