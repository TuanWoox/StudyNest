import React, { useState, useEffect } from "react";
import { Modal, Input, theme } from "antd";
import { Folder } from "@/types/note/notes";
import useCreateFolder from "@/hooks/folderHook/useCreateFolder";
import useUpdateFolder from "@/hooks/folderHook/useUpdateFolder";
import useDeleteFolder from "@/hooks/folderHook/useDeleteFolder";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

type ModalMode = "create" | "update" | "delete";

interface ModalFolderProps {
    visible: boolean;
    mode: ModalMode;
    // darkMode: boolean;
    onCancel: () => void;
    folder?: Folder | null;
    setSelectedFolder?: React.Dispatch<React.SetStateAction<Folder | null>>;
}

const ModalFolder: React.FC<ModalFolderProps> = ({
    visible,
    mode,
    // darkMode,
    onCancel,
    folder,
    setSelectedFolder,
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const [folderName, setFolderName] = useState("");

    const { createFolder, isLoading: creating } = useCreateFolder();
    const { updateFolder, isLoading: updating } = useUpdateFolder();
    const { deleteFolder, isLoading: deleting } = useDeleteFolder();

    useEffect(() => {
        if (mode === "update" && folder) setFolderName(folder.folderName || "");
        else if (mode === "create") setFolderName("");
    }, [mode, folder]);

    const handleClose = () => {
        setFolderName("");
        setSelectedFolder?.(null);
        onCancel();
    };

    const handleSubmit = () => {
        if (mode === "create" && folderName.trim() !== "") {
            createFolder(
                { id: "string", folderName: folderName.trim(), ownerId: "string" },
                { onSuccess: handleClose }
            );
        } else if (mode === "update" && folder && folderName.trim() !== "") {
            updateFolder(
                { id: folder.id, folderName: folderName.trim() },
                { onSuccess: handleClose }
            );
        } else if (mode === "delete" && folder) {
            deleteFolder(folder.id, { onSuccess: handleClose });
        }
    };

    const titleMap = {
        create: "Create New Folder",
        update: "Update Folder",
        delete: "Delete Folder",
    };

    const actionTextMap = {
        create: "Create",
        update: "Update",
        delete: "Delete",
    };

    const isLoading = creating || updating || deleting;

    // === Retro theme style tokens ===
    const borderColor = `${token.colorPrimary}E0`; // 88%
    const shadowColor = `${token.colorPrimary}55`; // 33%
    const hoverShadowColor = `${token.colorPrimary}88`; // hover sáng hơn
    const backgroundColor = darkMode ? "#1E1E1E" : "#FFFEFA";
    const textColor = darkMode ? "#E5E7EB" : "#111827";

    return (
        <Modal
            open={visible}
            title={
                <span
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontWeight: 700,
                        color: borderColor,
                        letterSpacing: 0.5,
                    }}
                >
                    {titleMap[mode]}
                </span>
            }
            onCancel={handleClose}
            onOk={handleSubmit}
            okText={isLoading ? `${actionTextMap[mode]}ing...` : actionTextMap[mode]}
            cancelText="Cancel"
            okButtonProps={{
                loading: isLoading,
                danger: mode === "delete",
                style: {
                    backgroundColor:
                        mode === "delete"
                            ? darkMode
                                ? "#dc2626"
                                : "#ef4444"
                            : borderColor,
                    border: `1px solid ${borderColor}`,
                    fontFamily: '"Courier New", monospace',
                    fontWeight: 600,
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    transition: "all 0.2s ease",
                },
                className: `
                    hover:-translate-y-[2px] hover:brightness-110 hover:shadow-[3px_3px_0_${hoverShadowColor}]
                    active:translate-y-[1px] active:shadow-[1px_1px_0_${hoverShadowColor}]
                `,
            }}
            cancelButtonProps={{
                style: {
                    color: darkMode ? "#D1D5DB" : "#374151",
                    backgroundColor: darkMode ? "#1F2937" : "#E5E7EB",
                    border: `1px solid ${borderColor}`,
                    fontFamily: '"Courier New", monospace',
                    boxShadow: `3px 3px 0 ${shadowColor}`,
                    transition: "all 0.2s ease",
                },
                className: `
                    hover:-translate-y-[2px] hover:brightness-105 hover:shadow-[3px_3px_0_${hoverShadowColor}]
                    active:translate-y-[1px] active:shadow-[1px_1px_0_${hoverShadowColor}]
                `,
                disabled: isLoading,
            }}
            centered
            closable={false}
            maskClosable={false}
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
            {mode === "delete" ? (
                <p
                    style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: 14,
                        color: textColor,
                        lineHeight: 1.6,
                    }}
                >
                    Are you sure you want to delete the folder{" "}
                    <span
                        style={{
                            fontWeight: 700,
                            color: borderColor,
                        }}
                    >
                        {folder?.folderName}
                    </span>
                    ? <br />
                    This action{" "}
                    <span className="text-red-500 font-semibold">cannot be undone.</span>
                </p>
            ) : (
                <Input
                    placeholder="Folder name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onPressEnter={handleSubmit}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: `1px solid ${borderColor}`,
                        background: darkMode ? "#2D2D2D" : "#FFFDF8",
                        color: textColor,
                        fontFamily: '"Courier New", monospace',
                        fontSize: 14,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                        transition: "all 0.2s ease",
                    }}
                    className="hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(0,0,0,0.2)]"
                />
            )}
        </Modal>
    );
};

export default ModalFolder;
