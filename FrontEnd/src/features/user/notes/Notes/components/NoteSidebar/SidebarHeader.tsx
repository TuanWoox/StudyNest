import React from "react";
import { Button, Typography, theme } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface SidebarHeaderProps {
    onCreate: () => void;
}

const { Title, Text } = Typography;

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onCreate }) => {
    const { token } = theme.useToken();
    const shadowColor = `${token.colorPrimary}55`;
    const borderColor = `${token.colorPrimary}E0`;

    return (
        <div className="mb-3 flex justify-between items-center" style={{ color: token.colorText }}>
            <div>
                <Title level={2}
                    style={{
                        margin: 0,
                        fontWeight: 700,
                        fontFamily: "monospace"
                    }}>
                    Note Management
                </Title>
                <Text
                    type="secondary"
                    style={{
                        fontSize: 15,
                        marginTop: 4,
                        display: "block",
                        fontFamily: "monospace"
                    }}
                >
                    Manage your notes
                </Text>
            </div>

            <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={onCreate}
                style={{
                    fontWeight: 600,
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    border: `1px solid ${borderColor}`,
                    fontFamily: '"Courier New", monospace',
                    borderRadius: 0,
                    fontSize: 20,
                    lineHeight: 0.75,
                }}
            >
                New
            </Button>
        </div>
    );
};

export default SidebarHeader;
