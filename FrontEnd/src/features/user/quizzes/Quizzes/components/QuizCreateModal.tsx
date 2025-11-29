import React from "react";
import { Modal, Button, Space, theme, Typography } from "antd";
import { FileTextOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface QuizCreateModalProps {
    visible: boolean;
    onCancel: () => void;
    onGenerateFromNote: () => void;
    onCreateFromScratch: () => void;
}

const QuizCreateModal: React.FC<QuizCreateModalProps> = ({
    visible,
    onCancel,
    onGenerateFromNote,
    onCreateFromScratch,
}) => {
    const { token } = theme.useToken();
    const borderColor = `${token.colorPrimary}55`;
    const shadowColor = `${token.colorPrimary}55`;
    const backgroundColor = token.colorBgElevated;

    return (
        <Modal
            open={visible}
            title={
                <div
                    style={{
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 700,
                        fontSize: 20,
                        background: backgroundColor,
                    }}
                >
                    Create New Quiz
                </div>
            }
            centered
            onCancel={onCancel}
            footer={null}
            closable={true}
            styles={{
                mask: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                },
                content: {
                    backgroundColor,
                    border: `1px solid ${borderColor}`,
                    boxShadow: `4px 4px 0 ${shadowColor}`,
                    padding: "28px 30px",
                    fontFamily: '"Courier New", monospace',
                    transition: "all 0.3s ease",
                },
            }}
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Text style={{ fontSize: 15 }}>Choose how you want to create your quiz:</Text>

                {/* Generate from Note */}
                <Button
                    type="default"
                    icon={<FileTextOutlined />}
                    onClick={onGenerateFromNote}
                    size="large"
                    block
                    style={{
                        height: "auto",
                        padding: "16px 24px",
                        borderRadius: 0,
                        border: `1px solid ${borderColor}`,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    }}
                >
                    <div style={{ textAlign: "left", flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>Generate from Note</div>
                        <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.8, wordWrap: "break-word", whiteSpace: "normal" }}>
                            Use AI to create quiz questions from your existing notes
                        </div>
                    </div>
                </Button>

                {/* Create from Scratch */}
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onCreateFromScratch}
                    size="large"
                    block
                    style={{
                        height: "auto",
                        padding: "16px 24px",
                        borderRadius: 0,
                        border: `1px solid ${borderColor}`,
                        boxShadow: `2px 2px 0 ${token.colorPrimaryBorder}`,
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                    }}
                >
                    <div style={{ textAlign: "left", flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>Create from Scratch</div>
                        <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.9, wordWrap: "break-word", whiteSpace: "normal" }}>
                            Manually create and customize your own quiz questions
                        </div>
                    </div>
                </Button>

                {/* Cancel Button */}
                <Button
                    onClick={onCancel}
                    block
                    style={{
                        borderRadius: 0,
                        border: `1px solid ${borderColor}`,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </Button>
            </Space>
        </Modal>
    );
};

export default QuizCreateModal;
