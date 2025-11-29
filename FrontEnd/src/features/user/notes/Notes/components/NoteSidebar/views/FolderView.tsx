import React from "react";
import { Collapse, Button, Dropdown, Menu, Tooltip, theme, Pagination, Grid, Skeleton } from "antd";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from "@ant-design/icons";
import NoteCard from "@/features/user/notes/Notes/components/NoteCard";
import { Folder, Note } from "@/types/note/notes";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface Props {
    folders: Folder[];
    selectedNote: Note | null;
    handleOpenEditor: (note: Note) => void;
    handleCreateNote: (folder?: Folder) => void;
    setFolderModalMode: (mode: "create" | "update" | "delete") => void;
    setIsModalFolderVisible: (v: boolean) => void;
    setSelectedFolder: (f: Folder | null) => void;
    folderPage: number;
    folderPageSize: number;
    totalFolders: number;
    handleFolderChange: (page: number, pageSize: number) => void;
    isLoading?: boolean;
}

const FolderView: React.FC<Props> = ({
    folders,
    selectedNote,
    handleOpenEditor,
    handleCreateNote,
    setFolderModalMode,
    setIsModalFolderVisible,
    setSelectedFolder,
    folderPage,
    folderPageSize,
    totalFolders,
    handleFolderChange,
    isLoading = false
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const screens = Grid.useBreakpoint();

    const borderColor = `${token.colorPrimary}E0`;
    const shadowColor = `${token.colorPrimary}55`;

    const items = folders.map((folder) => {
        const menu = (
            <Menu
                onClick={(e) => e.domEvent.stopPropagation()}
                items={[
                    { key: 'create-note', icon: <PlusOutlined />, label: 'Create Note', onClick: () => handleCreateNote(folder) },
                    { key: 'edit', icon: <EditOutlined />, label: 'Edit Folder', onClick: () => { setSelectedFolder(folder); setFolderModalMode('update'); setIsModalFolderVisible(true); } },
                    { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Delete Folder', onClick: () => { setSelectedFolder(folder); setFolderModalMode('delete'); setIsModalFolderVisible(true); } },
                ]}
            />
        );

        return {
            key: folder.id,
            label: (
                <div className="flex justify-between items-center w-full overflow-hidden" style={{ fontFamily: '"Courier New", monospace' }}>
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <FolderOutlined />
                        <Tooltip title={folder.folderName} placement="topLeft">
                            <span className="font-semibold line-clamp-1 cursor-pointer transition-all">
                                {folder.folderName}
                            </span>
                        </Tooltip>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                            style={{
                                fontSize: 12,
                                opacity: 0.7
                            }}
                        >
                            {folder.notes?.length || 0} notes
                        </span>
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <Button
                                size="small"
                                icon={<MoreOutlined />}
                                style={{
                                    border: 'none',
                                    background: 'transparent'
                                }}
                                onClick={(e) => e.stopPropagation()} />
                        </Dropdown>
                    </div>
                </div>
            ),
            children: folder.notes?.length ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ fontFamily: '"Courier New", monospace' }}>
                    {folder.notes.map((note: Note) => (
                        <NoteCard key={note.id} note={note} isSelected={selectedNote?.id === note.id} onSelect={() => handleOpenEditor(note)} isDeleteAvailable />
                    ))}
                </div>
            ) : (
                <div className="text-center py-3 italic text-sm select-none" style={{ opacity: 0.7, fontFamily: '"Courier New", monospace' }}>No notes in this folder</div>
            ),
            style: {
                background: darkMode ? "linear-gradient(135deg, #1E293B, #334155)" : '#FDFBF8',
                borderRadius: 0,
                marginBottom: 8,
                border: `1px solid ${borderColor}`,
                boxShadow: `3px 3px 0 ${shadowColor}`,
                transition: 'all 0.3s ease',
            },
        };
    });

    if (folders.length === 0) {
        if (isLoading) {
            const placeholders = Array.from({ length: folderPageSize || 4 });

            return (
                <div className="flex flex-col gap-4">
                    {placeholders.map((_, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: darkMode
                                    ? "linear-gradient(135deg, #1E293B, #334155)"
                                    : "#FDFBF8",
                                borderRadius: 0,
                                border: `1px solid ${borderColor}`,
                                boxShadow: `3px 3px 0 ${shadowColor}`,
                                padding: "16px",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {/* Folder header skeleton */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {/* Folder icon placeholder */}
                                    <Skeleton.Avatar
                                        active
                                        size="small"
                                        shape="square"
                                        style={{ backgroundColor: token.colorBorderSecondary }}
                                    />

                                    {/* Folder name placeholder */}
                                    <Skeleton.Input
                                        active
                                        size="small"
                                        style={{
                                            width: 120,
                                            backgroundColor: token.colorBorderSecondary,
                                        }}
                                    />
                                </div>

                                {/* Folder actions placeholder */}
                                <Skeleton.Input
                                    active
                                    size="small"
                                    style={{
                                        width: 60,
                                        backgroundColor: token.colorBorderSecondary,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <EmptyState
                type="empty"
                title="No Folders Yet"
                description="You haven't created any folders yet. Create your first note to get started!"
                actionLabel="Create New Note"
                actionIcon={<PlusOutlined />}
                onAction={() => handleCreateNote()}
            />
        );
    };

    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <h3 style={{ fontWeight: 625, fontSize: '18px', color: token.colorText }}> <FolderOutlined /> Folders</h3>
                <Button
                    type="default"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setFolderModalMode("create");
                        setIsModalFolderVisible(true);
                    }}
                    style={{
                        background: darkMode ? "linear-gradient(135deg, #1E293B, #334155)" : '#FDFBF8',
                        border: `1px solid ${borderColor}`,
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        fontWeight: 500,
                        borderRadius: 0,
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget.style.background = darkMode
                            ? "linear-gradient(135deg, #334155, #475569)"
                            : "linear-gradient(135deg, #E5E7EB, #D1D5DB)");
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget.style.background = darkMode
                            ? "linear-gradient(135deg, #1E293B, #334155)"
                            : "#FDFBF8");
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    Add Folder
                </Button>
            </div>
            <Collapse
                ghost
                expandIconPosition="end"
                style={{
                    backgroundColor: 'transparent',
                    borderRadius: '8px'
                }}
                items={items}
            />
            <div
                style={{
                    marginTop: 32,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Pagination
                    current={folderPage}
                    pageSize={folderPageSize}
                    total={totalFolders}
                    onChange={handleFolderChange}
                    showSizeChanger={!screens.xs}
                    simple={screens.xs}
                    showTotal={!screens.xs ? (total, range) => (
                        <span style={{ fontFamily: "monospace" }}>
                            {screens.md ? `${range[0]}-${range[1]} of ${total} folders` : `${total} folders`}
                        </span>
                    ) : undefined}
                    pageSizeOptions={[5, 10, 20, 50]}
                    style={{
                        fontFamily: "monospace",
                    }}
                />
            </div>
        </>
    );
};

export default FolderView;
