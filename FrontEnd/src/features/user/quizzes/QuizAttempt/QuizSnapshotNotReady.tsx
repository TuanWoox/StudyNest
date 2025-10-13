import { ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Card, Typography, Space, Alert, Spin } from 'antd';

const { Title, Paragraph } = Typography;

const QuizSnapshotNotReady = () => {
    return (

        <div className="mx-auto my-auto px-4 sm:px-6 lg:px-8 py-20">
            <Card
                className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl shadow-xl"
                style={{
                    borderRadius: '16px',
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
                                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                                style={{ color: '#1890ff' }}
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
                                color: '#1a1a1a',
                            }}
                        >
                            Quiz Snapshot In Progress
                        </Title>

                        <Paragraph
                            className="text-sm sm:text-base"
                            style={{
                                color: '#666',
                                maxWidth: '500px',
                                margin: '0 auto 16px',
                                lineHeight: 1.6,
                            }}
                        >
                            Your quiz snapshot is currently being generated. This process typically takes 1-2 minutes.
                        </Paragraph>
                    </div>

                    <Alert
                        message={
                            <span className="text-sm sm:text-base font-semibold ">
                                Processing Your Data
                            </span>
                        }
                        description={
                            <span className="text-xs sm:text-sm block mt-1">
                                This page will refresh automatically once ready. You may also navigate away and return later.
                            </span>
                        }
                        type="info"
                        showIcon
                        icon={<ClockCircleOutlined className="text-lg sm:text-xl" />}
                        className="text-left mx-2 sm:mx-auto"
                        style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                        }}
                    />

                    <Paragraph
                        type="secondary"
                        className="text-xs sm:text-sm !mt-4 !mb-0"
                    >
                        Thank you for your patience
                    </Paragraph>
                </Space>
            </Card>
        </div>

    );
};

export default QuizSnapshotNotReady;