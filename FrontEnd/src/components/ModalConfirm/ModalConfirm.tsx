import React from "react";
import { Modal, theme } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface ModalConfirmProps {
    open: boolean;
    title?: string;
    content?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    onOk: () => void;
    onCancel: () => void;
    loading?: boolean;
    // darkMode?: boolean;
    danger?: boolean;
    centered?: boolean;
    icon?: React.ReactNode;
    disableCloseWhenLoading?: boolean;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
    open,
    title = "Confirmation",
    content = "Are you sure you want to proceed?",
    okText = "Confirm",
    cancelText = "Cancel",
    onOk,
    onCancel,
    loading = false,
    // darkMode = false,
    danger = false,
    centered = true,
    icon,
    disableCloseWhenLoading = true,
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const borderColor = `${token.colorPrimary}E0`;
    const shadowColor = `${token.colorPrimary}55`;
    const hoverShadowColor = `${token.colorPrimary}88`;
    const backgroundColor = token.colorPrimaryBg;
    const textColor = darkMode ? "#E5E7EB" : "#111827";

    return (
        <Modal
            open={open}
            title={
                <div
                    style={{
                        fontFamily: "'Courier New', monospace",
                        color: danger ? "#B91C1C" : "#B45309",
                        fontWeight: 700,
                        backgroundColor: backgroundColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {icon || <ExclamationCircleOutlined />} {title}
                </div>
            }
            onOk={onOk}
            onCancel={onCancel}
            okText={loading ? "Processing..." : okText}
            cancelText={cancelText}
            okButtonProps={{
                danger,
                loading,
                style: {
                    backgroundColor: danger
                        ? darkMode
                            ? "#dc2626"
                            : "#ef4444"
                        : darkMode
                            ? "#b45309"
                            : "#f59e0b",
                    border: `1px solid ${borderColor}`,
                    fontFamily: '"Courier New", monospace',
                    fontWeight: 600,
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    transition: "all 0.2s ease",
                },
                className: `
          hover:-translate-y-[2px] hover:brightness-105 hover:shadow-[3px_3px_0_${hoverShadowColor}]
          active:translate-y-[1px] active:shadow-[1px_1px_0_${hoverShadowColor}]
        `,
            }}
            cancelButtonProps={{
                disabled: loading,
                style: {
                    fontFamily: '"Courier New", monospace',
                    border: `1px solid ${borderColor}`,
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    transition: "all 0.2s ease",
                },
                className: `
          hover:-translate-y-[2px] hover:brightness-105 hover:shadow-[3px_3px_0_${hoverShadowColor}]
          active:translate-y-[1px] active:shadow-[1px_1px_0_${hoverShadowColor}]
        `,
            }}
            closable={!loading || !disableCloseWhenLoading}
            maskClosable={!loading || !disableCloseWhenLoading}
            centered={centered}
            styles={{
                mask: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                },
                content: {
                    backgroundColor,
                    border: `1px solid ${borderColor}`,
                    boxShadow: `4px 4px 0 ${shadowColor}`,
                    padding: 20,
                    fontFamily: '"Courier New", monospace',
                    color: textColor,
                },
            }}
        >
            <p
                style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 14,
                    lineHeight: 1.6,
                }}
            >
                {content}
            </p>
        </Modal>
    );
};

export default ModalConfirm;
