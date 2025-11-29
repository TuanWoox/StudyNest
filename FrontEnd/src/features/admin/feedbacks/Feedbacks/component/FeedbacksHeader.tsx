import React from "react";
import { Button, Flex, Typography, Space, theme, Grid } from "antd";
import { DeleteOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useToken } = theme;

interface SettingsHeaderProps {
    onRefresh: () => void;
    onCreate: () => void;
    selectedCount?: number;             // <- new
    onBulkDelete?: () => void;          // <- new
}

const FeedBacksHeader: React.FC<SettingsHeaderProps> = ({
    onRefresh,
    onCreate,
    selectedCount = 0,
    onBulkDelete,
}) => {
    const { token } = useToken();
    const screens = Grid.useBreakpoint();

    const borderColor = `2px solid ${token.colorPrimary}E0`;


    return (
        <Flex
            vertical={screens.xs}
            justify="space-between"
            align={screens.xs ? "stretch" : "center"}
            gap={screens.xs ? 16 : 20}
            style={{ marginBottom: 32 }}
        >
            {/* Left Title Section */}
            <div
                style={{
                    flex: screens.xs ? "1 1 100%" : "0 0 auto",
                    minWidth: screens.xs ? "100%" : 250,
                }}
            >
                <Title
                    level={2}
                    style={{
                        margin: 0,
                        fontWeight: 700,
                        fontFamily: "monospace",
                    }}
                >
                    FeedBacks
                </Title>

                <Text
                    type="secondary"
                    style={{
                        fontSize: 15,
                        marginTop: 4,
                        display: "block",
                        fontFamily: "monospace",
                    }}
                >
                    Manage Your FeedBacks
                </Text>
            </div>

            {/* Right Controls Section */}
            <Space
                size={[8, 8]}
                style={{
                    width: screens.xs ? "100%" : "auto",
                    maxWidth: screens.xs ? "100%" : undefined,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >

                {/* Refresh Button */}
                <Button
                    icon={<ReloadOutlined />}
                    size="large"
                    onClick={onRefresh}
                    style={{
                        borderRadius: 0,
                        fontFamily: "monospace",
                        border: borderColor,
                        fontWeight: 600,
                        paddingInline: 12,
                    }}
                />

                {/* Delete selected: only render if handler provided */}
                {onBulkDelete && (
                    <Button
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="large"
                        danger
                        disabled={!selectedCount}
                        onClick={onBulkDelete}
                        style={{
                            fontFamily: "monospace",
                            border: `1px solid `,
                            fontWeight: 600,
                            paddingInline: screens.xs ? 12 : 20,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {screens.lg ? `Delete selected (${selectedCount})` : `(${selectedCount})`}
                    </Button>
                )}
            </Space>
        </Flex>
    );
};

export default FeedBacksHeader;
