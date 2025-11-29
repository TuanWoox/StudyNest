import React from "react";
import { Collapse, Button, theme, Pagination, Grid, Skeleton } from "antd";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { PlusOutlined, TagsOutlined } from "@ant-design/icons";
import NoteCard from "@/features/user/notes/Notes/components/NoteCard";
import { Tag, NoteTag, Note, Folder } from "@/types/note/notes";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface Props {
    tags: Tag[];
    selectedNote: Note | null;
    handleOpenEditor: (note: Note) => void;
    handleCreateNote: (folder?: Folder) => void;
    tagPage: number;
    tagPageSize: number;
    totalTags: number;
    handleTagChange: (page: number, pageSize: number) => void;
    isLoading?: boolean;
}

const TagView: React.FC<Props> = ({
    tags,
    selectedNote,
    handleOpenEditor,
    handleCreateNote,
    tagPage,
    tagPageSize,
    totalTags,
    handleTagChange,
    isLoading = false,
}) => {

    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();
    const screens = Grid.useBreakpoint();
    const borderColor = `${token.colorPrimary}E0`;
    const shadowColor = `${token.colorPrimary}55`;

    const items = tags.map((tag) => ({
        key: tag.id,
        label: (
            <div
                className="flex justify-between items-center w-full"
                style={{
                    fontFamily: '"Courier New", monospace',
                }}
            >
                <span style={{ fontWeight: 600 }}>
                    <TagsOutlined /> {tag.name}
                </span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {tag.noteTags?.length || 0} notes
                </span>
            </div>
        ),
        children: tag.noteTags?.length ? (
            <div
                className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                style={{ fontFamily: '"Courier New", monospace' }}
            >
                {tag.noteTags.map((noteTag: NoteTag) =>
                    noteTag.note ? (
                        <NoteCard
                            key={noteTag.note.id}
                            note={noteTag.note}
                            isSelected={selectedNote?.id === noteTag.note.id}
                            onSelect={() => handleOpenEditor(noteTag.note!)}
                            isDeleteAvailable
                        />
                    ) : null
                )}
            </div>
        ) : (
            <div
                className="text-center py-3 italic text-sm select-none"
                style={{ opacity: 0.7 }}
            >
                No notes with this tag
            </div>
        ),
        style: {
            background: darkMode ? "linear-gradient(135deg, #1E293B, #334155)" : '#FDFBF8',
            borderRadius: 0,
            marginBottom: 8,
            border: `1px solid ${borderColor}`,
            boxShadow: `3px 3px 0 ${shadowColor}`,
        },
    }));

    if (tags.length === 0 || tags.every((t) => !t.noteTags || t.noteTags.length === 0)) {
        if (isLoading) {
            const placeholders = Array.from({ length: tagPageSize || 4 });

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
                            {/* Tag header skeleton */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {/* Tag icon placeholder */}
                                    <Skeleton.Avatar
                                        active
                                        size="small"
                                        shape="square"
                                        style={{ backgroundColor: token.colorBorderSecondary }}
                                    />

                                    {/* Tag name placeholder */}
                                    <Skeleton.Input
                                        active
                                        size="small"
                                        style={{
                                            width: 120,
                                            backgroundColor: token.colorBorderSecondary,
                                        }}
                                    />
                                </div>

                                {/* Tag actions placeholder */}
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
                title="No Tags Yet"
                description="You haven't added any tags to your notes yet. Create a note and add tags to organize better!"
                actionLabel="Create New Note"
                actionIcon={<PlusOutlined />}
                onAction={() => handleCreateNote()}
            />
        );
    };

    return (
        <>
            <div className="flex justify-between items-center mb-2">
                <h3 style={{ fontWeight: 625, fontSize: '18px', color: token.colorText }}><TagsOutlined /> Tags</h3>
            </div>
            <Collapse
                ghost
                expandIconPosition="end"
                style={{
                    backgroundColor: token.colorBgLayout,
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
                    current={tagPage}
                    pageSize={tagPageSize}
                    total={totalTags}
                    onChange={handleTagChange}
                    showSizeChanger={!screens.xs}
                    simple={screens.xs}
                    showTotal={!screens.xs ? (total, range) => (
                        <span style={{ fontFamily: "monospace" }}>
                            {screens.md ? `${range[0]}-${range[1]} of ${total} tags` : `${total} tags`}
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

export default TagView;
