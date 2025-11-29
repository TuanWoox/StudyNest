import React from "react";
import { Button, Flex, Typography, Space, Input, theme, Grid } from "antd";
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { useToken } = theme;

interface SettingsHeaderProps {
    onRefresh: () => void;
    onCreate: () => void;
    selectedCount?: number;             // <- new
    onBulkDelete?: () => void;          // <- new
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({
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
                    Settings
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
                    Manage application settings
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
                {/* Search Input
                <Input
                    placeholder={screens.xs ? "Search..." : "Search key or group..."}
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    size="large"
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        borderRadius: 0,
                        fontFamily: "monospace",
                        border: borderColor,
                    }}
                    allowClear
                /> */}

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

                {/* Create New Setting */}
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={onCreate}
                    style={{
                        borderRadius: 0,
                        fontFamily: "monospace",
                        border: borderColor,
                        fontWeight: 600,
                        paddingInline: screens.xs ? 12 : 20,
                        whiteSpace: "nowrap",
                    }}
                >
                    {screens.lg ? "New Setting" : ""}
                </Button>

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

export default SettingsHeader;
