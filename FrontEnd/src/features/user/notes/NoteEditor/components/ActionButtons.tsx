import React, { useState } from "react";
import { Button, theme } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import ModalConfirm from "@/components/ModalConfirm/ModalConfirm";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface ActionButtonsProps {
    onSave: () => void;
    onClose: () => void;
    // darkMode: boolean;
    isCreating?: boolean;
    isUpdating?: boolean;
    confirmBeforeClose?: boolean | (() => boolean);
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onSave,
    onClose,
    // darkMode,
    isCreating = false,
    isUpdating = false,
    confirmBeforeClose,
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const primary88 = `${token.colorPrimary}E0`;
    const primary33 = `${token.colorPrimary}55`;

    const isLoading = isCreating || isUpdating;

    const baseStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 22px",
        fontSize: "15px",
        fontWeight: 600,
        fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
        transition: "all 0.3s ease",
        boxShadow: `3px 3px 0 ${primary33}`,
    };

    // 🔵 Hover effects
    const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `5px 5px 0 ${primary33}`;
        e.currentTarget.style.borderColor = token.colorPrimary;
    };
    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `3px 3px 0 ${primary33}`;
        e.currentTarget.style.borderColor = primary88;
    };

    // 🧡 Modal confirm before close
    const showConfirmModal = () => setIsModalOpen(true);
    const handleConfirmClose = () => {
        setIsModalOpen(false);
        onClose();
    };

    // 🔍 Check and handle close action
    const handleCloseClick = () => {
        // Check if we need confirmation
        const needsConfirmation = typeof confirmBeforeClose === 'function'
            ? confirmBeforeClose()
            : confirmBeforeClose;

        if (needsConfirmation && !isLoading) {
            showConfirmModal();
        } else {
            onClose();
        }
    };


    return (
        <>
            {/* ⚠️ Close confirmation modal */}
            <ModalConfirm
                open={isModalOpen}
                title="Unsaved Changes"
                content={
                    <>
                        You have unsaved changes. <br />
                        Are you sure you want to{" "}
                        <b style={{ color: "#B45309" }}>close without saving</b>?
                    </>
                }
                okText="Close without saving"
                cancelText="Cancel"
                // darkMode={darkMode}
                onOk={handleConfirmClose}
                onCancel={() => setIsModalOpen(false)}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
                {/* 🧡 Close */}
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={handleCloseClick}
                    disabled={isLoading}
                    style={{
                        ...baseStyle,
                        border: `1px solid ${primary88}`,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                        color: darkMode ? "#F97316" : "#EA580C",
                    }}
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                >
                    Close
                </Button>

                {/* ✅ Save */}
                <Button
                    type="text"
                    onClick={onSave}
                    icon={<SaveOutlined />}
                    loading={isLoading}
                    style={{
                        ...baseStyle,
                        border: `1px solid ${primary88}`,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                        color: token.colorPrimary,
                    }}
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                >
                    Save
                </Button>
            </div>
        </>
    );
};

export default ActionButtons;
