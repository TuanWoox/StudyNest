import React, { useState } from 'react';
import { Input, Button, Space, Tooltip, Collapse, Dropdown, Menu, Empty } from 'antd';
import { SearchOutlined, PlusOutlined, FileTextOutlined, FolderOutlined, TagsOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import NoteCard from './NoteCard';
import { Note, Folder, Tag, NoteTag } from '@/types/note/notes';

interface NoteSidebarProps {
    darkMode: boolean;
    notes: Note[];
    folders: Folder[];
    tags: Tag[];
    selectedNote: Note | null;
    handleOpenEditor: (note: Note) => void;
    handleCreateNote: (folder?: Folder | undefined) => void;
    setFolderModalMode: React.Dispatch<React.SetStateAction<"delete" | "create" | "update">>;
    setIsModalFolderVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedFolder: React.Dispatch<React.SetStateAction<Folder | null>>;
    handleDeleteNote: (id: string) => void;
}

type ViewMode = 'all' | 'folder' | 'tag';

const NoteSidebar: React.FC<NoteSidebarProps> = ({
    darkMode,
    notes,
    folders,
    tags,
    selectedNote,
    handleOpenEditor,
    handleCreateNote,
    setFolderModalMode,
    setIsModalFolderVisible,
    setSelectedFolder,
    handleDeleteNote,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('all');

    // Filter
    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFolders = folders.filter((folder) =>
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Folder view: lấy notes từ folder.notes
    const folderItems = filteredFolders.map((folder) => {
        const menu = (
            <Menu
                onClick={(e) => e.domEvent.stopPropagation()} // thêm dòng này để ngăn mở collapse khi click edit hay delete folder

                items={[
                    {
                        key: 'create-note',
                        icon: <PlusOutlined />,
                        label: 'Create Note',
                        onClick: () => {
                            handleCreateNote(folder);
                        },
                    },
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: 'Edit Folder',
                        onClick: () => {
                            setSelectedFolder(folder);             // chọn folder hiện tại
                            setFolderModalMode("update");
                            setIsModalFolderVisible(true);
                        },
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        label: 'Delete Folder',
                        onClick: () => {
                            setSelectedFolder(folder);
                            setFolderModalMode("delete");
                            setIsModalFolderVisible(true);
                        },
                    },
                ]}
            />
        );

        return {
            key: folder.id,
            label: (
                <div className="flex justify-between items-center w-full overflow-hidden">
                    {/* Folder name */}
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <FolderOutlined className="flex-shrink-0" />
                        <Tooltip title={folder.folderName} placement="topLeft">
                            <span className="text-base font-semibold line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors">
                                {folder.folderName}
                            </span>
                        </Tooltip>
                    </div>

                    {/* Notes count + menu */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span style={{ fontSize: 12, color: '#999' }}>
                            {folder.notes?.length || 0} notes
                        </span>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button
                                size="small"
                                icon={<MoreOutlined />}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: darkMode ? '#E2E8F0' : '#111827',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    </div>
                </div>

            ),
            children: (folder.notes && folder.notes.length > 0) ? (
                <div className="grid gap-4
                    sm:grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4">
                    {folder.notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            darkMode={darkMode}
                            isSelected={selectedNote?.id === note.id}
                            onSelect={() => handleOpenEditor(note)}
                            onDelete={handleDeleteNote}
                            isDeleteAvailable={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-3 text-gray-500 italic text-sm select-none">
                    No notes in this folder
                </div>
            ),
            style: {
                background: darkMode
                    ? "linear-gradient(135deg, #1E293B, #334155)"
                    : "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                borderRadius: 8,
                marginBottom: 8,
                boxShadow: darkMode
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }
        };
    });

    // Tag view: lấy notes từ tag.noteTags[].note
    const tagItems = filteredTags.map((tag) => ({
        key: tag.id,
        label: (<div className="flex justify-between items-center w-full">
            <span style={{ fontWeight: 600, fontSize: 16 }}><TagsOutlined /> {tag.name}</span>
            <span style={{ fontSize: 12, color: '#999' }}>{tag.noteTags?.length || 0} notes</span>
        </div>),
        children: (tag.noteTags && tag.noteTags.length > 0) ? (
            <div className="grid gap-4
                    sm:grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4">
                {tag.noteTags.map((noteTag: NoteTag) => (
                    noteTag.note ? (
                        <NoteCard
                            key={noteTag.note.id}
                            note={noteTag.note}
                            darkMode={darkMode}
                            isSelected={selectedNote?.id === noteTag.note.id}
                            onSelect={() => handleOpenEditor(noteTag.note!)}
                            onDelete={handleDeleteNote}
                            isDeleteAvailable={true}
                        />
                    ) : null
                ))}
            </div>
        ) : (
            <div className="text-center py-3 text-gray-500 italic text-sm select-none">
                No notes with this tag
            </div>
        ),
        style: {
            background: darkMode ? "linear-gradient(135deg, #1E293B, #334155)" : "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
            borderRadius: 8,
            marginBottom: 8,
            boxShadow: darkMode
                ? '0 1px 3px rgba(0,0,0,0.6)'
                : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
        },
    }));

    return (
        <div className="w-full shrink-0 h-full overflow-y-auto  p-4 border-r"
            style={{
                backgroundColor: darkMode ? "#0f0f0f" : "#FFFFFF",
                borderColor: darkMode ? "#212121" : "#E5E7EB",
                scrollbarWidth: "thin",
            }}>
            {/* Actions */}
            <div className="flex justify-between items-center mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNote()}>New</Button>
                <Space size="middle">
                    <Tooltip
                        title="All Notes"
                        getPopupContainer={(trigger) => trigger.parentElement!} // tránh render tooltip ra ngoài gây layout shift
                    >
                        <Button
                            icon={<FileTextOutlined />}
                            onClick={() => setViewMode("all")}
                            type={viewMode === "all" ? "primary" : "default"}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center" }} // giữ nút cố định kích thước
                        />
                    </Tooltip>

                    <Tooltip
                        title="Folder View"
                        getPopupContainer={(trigger) => trigger.parentElement!}
                    >
                        <Button
                            icon={<FolderOutlined />}
                            onClick={() => setViewMode("folder")}
                            type={viewMode === "folder" ? "primary" : "default"}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        />
                    </Tooltip>

                    <Tooltip
                        title="Tag View"
                        getPopupContainer={(trigger) => trigger.parentElement!} // quan trọng
                        placement="top" // tránh tooltip làm nhảy layout phía dưới
                    >
                        <Button
                            icon={<TagsOutlined />}
                            onClick={() => setViewMode("tag")}
                            type={viewMode === "tag" ? "primary" : "default"}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        />
                    </Tooltip>
                </Space>
            </div>
            {/* Search */}
            <Input
                placeholder={
                    viewMode === "all"
                        ? "Search notes..."
                        : viewMode === "folder"
                            ? "Search folders..."
                            : "Search tags..."
                }
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    marginBottom: "10px",
                    backgroundColor: darkMode ? "#334155" : "#FFFFFF",
                    color: darkMode ? "#E2E8F0" : "#111827",
                    borderColor: darkMode ? "#475569" : "#D1D5DB",
                }}
            />
            {/* Notes / Folders / Tags */}
            <div>
                {viewMode === "all" && (
                    filteredNotes.length === 0 ? (
                        <Empty
                            description="No notes found. Create your first note!"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 200,
                                marginTop: 40,
                            }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleCreateNote()}
                            >
                                Create New Note
                            </Button>
                        </Empty>
                    ) : (
                        <div className="grid gap-4
                            sm:grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4">
                            {filteredNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    darkMode={darkMode}
                                    isSelected={selectedNote?.id === note.id}
                                    onSelect={() => handleOpenEditor(note)}
                                    onDelete={handleDeleteNote}
                                    isDeleteAvailable={true}
                                />
                            ))}
                        </div>
                    )
                )}

                {viewMode === "folder" && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <h3 style={{ fontWeight: 625, fontSize: '18px' }}> <FolderOutlined /> Folders</h3>
                            <Button
                                type="default"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setFolderModalMode("create");
                                    setIsModalFolderVisible(true);
                                }}
                                style={{
                                    background: darkMode ? "linear-gradient(135deg, #1E293B, #334155)" : "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                                    border: "none",
                                    color: darkMode ? "#F1F5F9" : "#111827",
                                    fontWeight: 500,
                                    borderRadius: 8,
                                    padding: "0 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow: darkMode
                                        ? "0 1px 3px rgba(0,0,0,0.6)"
                                        : "0 1px 3px rgba(0,0,0,0.1)",
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
                                        : "linear-gradient(135deg, #F3F4F6, #E5E7EB)");
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Add Folder
                            </Button>
                        </div>
                        {(filteredFolders.length === 0 || filteredFolders.every(f => !f.notes || f.notes.length === 0)) ? (
                            <Empty
                                description="No notes in any folder"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{ minHeight: 200, marginTop: 40 }}
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleCreateNote()}
                                >
                                    Create New Note
                                </Button>
                            </Empty>
                        ) : (
                            <Collapse
                                ghost
                                expandIconPosition="end"
                                style={{
                                    backgroundColor: 'transparent',
                                    borderRadius: '8px',
                                }}
                                items={folderItems}
                            />
                        )}
                    </>
                )}

                {viewMode === "tag" && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <h3 style={{ fontWeight: 625, fontSize: '18px' }}><TagsOutlined /> Tags</h3>
                        </div>
                        {(filteredTags.length === 0 || filteredTags.every(t => !t.noteTags || t.noteTags.length === 0)) ? (
                            <Empty
                                description="No notes with any tag"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                style={{ minHeight: 200, marginTop: 40 }}
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleCreateNote()}
                                >
                                    Create New Note
                                </Button>
                            </Empty>
                        ) : (
                            <Collapse
                                ghost
                                expandIconPosition="end"
                                style={{
                                    backgroundColor: darkMode ? "#0f0f0f" : "#FFFFFF",
                                    borderRadius: "8px",
                                }}
                                items={tagItems}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NoteSidebar;