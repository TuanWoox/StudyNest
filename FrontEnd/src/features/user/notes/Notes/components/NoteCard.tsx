import React, { useState } from "react";
import { Card, Tag as AntTag, Tooltip, Button, theme } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Note } from "@/types/note/notes";
import { getPlainTextFromEditorJs } from "@/utils/getPlainTextFromEditorJs";
import useDeleteNote from "@/hooks/noteHook/useDeleteNote";
import ModalConfirm from "@/components/ModalConfirm/ModalConfirm";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";
import { formatDMY } from "@/utils/date";

interface NoteCardProps {
    note: Note;
    // darkMode: boolean;
    isSelected: boolean;
    onSelect: () => void;
    isDeleteAvailable: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    // darkMode,
    isSelected,
    onSelect,
    isDeleteAvailable = false,
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { deleteNote, isLoading: deleting } = useDeleteNote();

    const tags = note.noteTags?.map((nt) => nt.tag) || [];

    // Theme colors
    const primary = token.colorPrimary;
    const borderColor = `${primary}E0`;
    const shadowColor = `${primary}55`;

    // Show confirmation modal
    const showDeleteModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    // Confirm delete
    const handleConfirmDelete = () => {
        try {
            deleteNote(note.id, { onSuccess: () => setIsModalOpen(false) });
        }
        catch (error) {
            console.error("Delete note failed:", error);
        }
    };

    return (
        <>
            {/* Delete confirmation modal */}
            <ModalConfirm
                open={isModalOpen}
                title="Confirm Note Deletion"
                content={
                    <>
                        Are you sure you want to{" "}
                        <b style={{ color: "#DC2626" }}>permanently delete</b> this note?
                        <br />
                        This action cannot be undone.
                    </>
                }
                okText={deleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                // darkMode={darkMode}
                danger
                loading={deleting}
                onOk={handleConfirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />

            {/* Note Card */}
            <Card
                onClick={onSelect}
                style={{
                    height: "100%",
                    userSelect: "none",
                    backgroundColor: darkMode ? "#1A1A1A" : "#FCFCFC",
                    // color: darkMode ? "#EDEDED" : "#111",
                    border: isSelected
                        ? `2px solid ${borderColor}`
                        : `1px solid ${borderColor}`,
                    cursor: "pointer",
                    borderRadius: "0px",
                    fontFamily: "'Courier New', monospace",
                    boxShadow:
                        isSelected ? `6px 6px 0 ${shadowColor}` :
                            `4px 4px 0 ${shadowColor}`,
                    transition: "all 0.25s ease",
                    transform: isSelected ? "translateY(-6px)" : "translateY(0)",
                    width: "100%",
                    position: "relative",
                }}
                className={`${darkMode
                    ? "hover:shadow-[6px_6px_0_rgba(255,255,255,0.3)]"
                    : "hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]"
                    } hover:-translate-y-[3px]`}
                styles={{
                    body: { padding: "18px" },
                }}
            >
                {/* 🗑️ Delete button */}
                {isDeleteAvailable && (
                    <div className="absolute top-2 right-2 z-10" onClick={showDeleteModal}>
                        <Tooltip title="Delete note">
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                style={{
                                    color: darkMode ? "#E57373" : "#C53030",
                                }}
                            />
                        </Tooltip>
                    </div>
                )}

                {/* Title */}
                <Tooltip title={note.title} placement="topLeft">
                    <h3
                        className="font-bold text-lg mb-3 line-clamp-1 cursor-pointer"
                        style={{
                            color: borderColor,
                            transition: "color 0.3s",
                        }}
                    >
                        {note.title}
                    </h3>
                </Tooltip>

                {/* Content preview */}
                <p
                    className="text-sm mb-4 line-clamp-2"
                // style={{ color: darkMode ? "#CCC" : "#333" }}
                >
                    {getPlainTextFromEditorJs(note.content) || "No content"}
                </p>

                {/* Folder */}
                <div
                    className="flex items-center mb-3 px-2 py-1 rounded-md"
                    style={{
                        backgroundColor: darkMode ? "#2C2C2C" : "#F4F4F4",
                        border: `1px dashed ${borderColor}`,
                    }}
                >
                    <span className="text-sm mr-2">📁</span>
                    <span className="text-xs font-medium">
                        {note?.folder?.folderName || "No Folder"}
                    </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.length > 0 ? (
                        tags.map((tag) => (
                            <AntTag
                                key={tag.id}
                                style={{
                                    backgroundColor: darkMode
                                        ? `${primary}33`
                                        : `${primary}22`,
                                    color: borderColor,
                                    borderRadius: "8px",
                                    padding: "2px 8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    border: `1px solid ${borderColor}`,
                                    fontFamily: "'Courier New', monospace",
                                }}
                            >
                                #{tag.name}
                            </AntTag>
                        ))
                    ) : (
                        <span className="text-xs italic px-2 py-1 rounded">
                            No tags
                        </span>
                    )}
                </div>

                {/* Dates */}
                <div
                    className="text-xs"
                    style={{ fontStyle: "italic" }}
                >
                    <div className="flex gap-1 justify-end">
                        <div className="opacity-90">
                            Created:
                        </div>
                        <div style={{ fontWeight: 700 }}>
                            {note.dateCreated ? formatDMY(note.dateCreated) : "N/A"}
                        </div>
                    </div>
                    <div className="flex gap-1 justify-end">
                        <div className="opacity-90">
                            Modified:
                        </div>
                        <div style={{ fontWeight: 700 }}>
                            {note.dateModified ? formatDMY(note.dateModified) : "N/A"}
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
};

export default NoteCard;
