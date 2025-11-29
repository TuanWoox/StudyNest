import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import { ClockCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Card, Typography, Space, Alert, Spin } from "antd";

const { Title } = Typography;

const QuizSnapshotNotReady = ({ darkMode = false }) => {
    const { primaryColor, borderColor, shadowColor } = useAntDesignTheme();

    return (
        <div className="w-full lg:max-w-9/10 mx-auto p-4">
            <div className="px-4 sm:px-6 lg:px-8 mt-16">
                <Card
                    className="w-full shadow-xl"
                    style={{
                        border: `1.5px solid ${borderColor}`,
                        boxShadow: `4px 4px 0 ${shadowColor}`,
                    }}
                >
                    <Space
                        direction="vertical"
                        size="middle"
                        className="w-full text-center py-6 sm:py-8 lg:py-12 xl:py-16"
                    >
                        <Spin
                            indicator={
                                <SyncOutlined
                                    spin
                                    style={{
                                        color: primaryColor,
                                        fontSize: "3rem",
                                    }}
                                />
                            }
                            size="large"
                        />

                        <div className="px-2 sm:px-4">
                            <Title
                                level={2}
                                className="!mb-2 sm:!mb-3 lg:!mb-4"
                                style={{
                                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                                    fontWeight: '600',
                                }}
                            >
                                Quiz Snapshot In Progress
                            </Title>

                            <span className="text-sm sm:text-base xl:text-2xl"
                                style={{
                                    maxWidth: '500px',
                                    margin: '0 auto 16px',
                                    lineHeight: 1.6,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Your quiz snapshot is currently being generated. This process typically takes 1-2 minutes.
                            </span>
                        </div>

                        <Alert
                            message={
                                <span className="text-sm sm:text-base xl:text-2xl font-semibold">
                                    Processing Your Data
                                </span>
                            }
                            description={
                                <span className="text-xs sm:text-sm xl:text-xl block mt-1">
                                    This page will refresh automatically once ready. You may also navigate away and return later.
                                </span>
                            }
                            type="info"
                            showIcon
                            icon={
                                <ClockCircleOutlined
                                    className="text-lg sm:text-xl"
                                    style={{ color: primaryColor }}
                                />
                            }
                            className={`text-left mx-2 sm:mx-auto transition-all duration-200 ${darkMode
                                ? "bg-blue-900/30 border-blue-500 text-blue-100"
                                : "bg-blue-50 border-blue-500 text-blue-800"
                                }`}
                            style={{
                                padding: "12px 16px",
                                borderLeftWidth: "4px",
                                borderLeftColor: primaryColor,
                                fontFamily: "'IBM Plex Mono', monospace",
                            }}
                        />

                        <span
                            className="text-sm sm:text-base xl:text-2xl !mt-4 !mb-0"
                            style={{
                                fontFamily: "'Courier New', monospace",
                            }}
                        >
                            Thank you for your patience
                        </span>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default QuizSnapshotNotReady;
