import React from 'react';
import { Card, Tag as AntTag, Popconfirm, Tooltip, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Note } from '@/types/note/notes';
import { getPlainTextFromEditorJs } from '@/utils/getPlainTextFromEditorJs';

interface NoteCardProps {
    note: Note;
    darkMode: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (id: string) => void;
    isDeleteAvailable: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
    note,
    darkMode,
    isSelected,
    onSelect,
    onDelete,
    isDeleteAvailable = false
}) => {
    // Lấy tags từ note.noteTags[].tag
    const tags = note.noteTags?.map(nt => nt.tag) || [];

    return (
        <Card
            onClick={onSelect}
            style={{
                userSelect: "none",
                backgroundColor: darkMode ? "#2D3748" : "#F7FAFC",
                color: darkMode ? "#F7FAFC" : "#1A202C",
                border: isSelected
                    ? `3px solid ${darkMode ? "#4299E1" : "#3182CE"}`
                    : `1px solid ${darkMode ? "#4A5568" : "#CBD5E0"}`,
                cursor: "pointer",
                borderRadius: "16px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isSelected
                    ? darkMode
                        ? "0 8px 25px rgba(66, 153, 225, 0.4), 0 0 0 1px rgba(66, 153, 225, 0.1)"
                        : "0 8px 25px rgba(49, 130, 206, 0.3), 0 0 0 1px rgba(49, 130, 206, 0.1)"
                    : darkMode
                        ? "0 4px 15px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)"
                        : "0 4px 15px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
                transform: isSelected ? "translateY(-2px)" : "translateY(0)",
                width: "100%",              // chiếm 100% ô grid
                margin: "0 auto",           // căn giữa khi lẻ cột
                position: "relative"
            }}
            className={`hover:scale-[1.01] hover:-translate-y-1 ${darkMode ? "hover:bg-gray-600 hover:shadow-xl" : "hover:bg-white hover:shadow-xl"
                }`}
            styles={{
                body: {
                    padding: "18px",
                },
            }}
        >
            {/* 🗑️ Nút xóa ở góc trên phải */}
            {isDeleteAvailable && (
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <Popconfirm
                        title="Delete this note?"
                        description="Are you sure you want to delete this note permanently?"
                        onConfirm={() => onDelete(note.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete note">
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            )}

            <Tooltip title={note.title} placement="topLeft">
                <h3 className="font-bold text-lg mb-3 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors">
                    {note.title}
                </h3>
            </Tooltip>

            <p className="text-sm mb-4 line-clamp-2">
                {getPlainTextFromEditorJs(note.content) || "No content"}
            </p>
            <div className="flex items-center mb-3 px-2 py-1 rounded-lg">
                <span className="text-sm mr-2">📁</span>
                <span className="text-xs font-medium">
                    {note?.folder?.folderName || "No Folder"}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                    tags.map((tag) => (
                        <AntTag key={tag.id} style={{
                            backgroundColor: darkMode ? "#553C9A" : "#E9D8FD",
                            color: darkMode ? "#F7FAFC" : "#553C9A",
                            borderRadius: "12px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                            border: "none",
                        }}>
                            #{tag.name}
                        </AntTag>
                    ))
                ) : (
                    <span className="text-xs italic px-2 py-1 rounded">
                        No tags
                    </span>
                )}
            </div>
        </Card>
    );
};

export default NoteCard;