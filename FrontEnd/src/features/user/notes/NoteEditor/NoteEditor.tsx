import React, { useState, useEffect } from 'react';
import { Modal, Popconfirm } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Note, Folder, Tag, CreateNoteDTO, UpdateNoteDTO } from '@/types/note/notes';
import TitleInput from './TitleInput';
import ActionButtons from './ActionButtons';
import FolderSelect from './FolderSelect';
import TagSelect from './TagSelect';
import EditorWrapper from './EditorWrapper';
import useCreateNote from '@/hooks/noteHook/useCreateNote';
import useCreateFolder from '@/hooks/folderHook/useCreateFolder';
import useUpdateNote from '@/hooks/noteHook/useUpdateNote';

interface NoteEditorProps {
    visible: boolean;
    onClose: () => void;
    darkMode: boolean;
    note: Note | null;
    folders: Folder[];
    tags: Tag[];
}

const NoteEditor: React.FC<NoteEditorProps> = ({
    visible, onClose, darkMode, note, folders, tags
}) => {
    const { createNote, isLoading: creatingNote } = useCreateNote();
    const { updateNote, isLoading: updatingNote } = useUpdateNote();
    const { createFolderAsync } = useCreateFolder();

    const [title, setTitle] = useState("");
    const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>(undefined);
    // Lấy tags từ note.noteTags[].tag
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [content, setContent] = useState("");


    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setSelectedFolder(note.folder);
            setSelectedTags(note.noteTags?.map(nt => nt.tag) || []);
            setContent(note.content);
        }
    }, [note?.id]);

    const handleSave = async () => {
        if (!note) return;

        let folderId = selectedFolder?.id || "";

        // Nếu folder mới chưa có id thực, gọi API tạo folder trước
        if (selectedFolder && selectedFolder.id.startsWith("temp-")) {
            const createdFolder = await createFolderAsync({
                id: "string", folderName: selectedFolder.folderName.trim(), ownerId: "string",
            });
            folderId = createdFolder.id;
            setSelectedFolder(createdFolder);
        };

        const tagsNames = selectedTags.map(tag => tag.name);

        // Nếu note chưa có id thật (id tạm), gọi API tạo note
        if (note.id.startsWith("note-")) {
            const payload: CreateNoteDTO = {
                id: "string",
                title,
                content,
                status: note.status,
                folderId,
                tagsNames,
                ownerId: note.ownerId,
            };
            createNote(payload
                , {
                    onSuccess: () => {
                        onClose();
                    }
                });
        } else {
            // Nếu đã có id thật, gọi API update (nếu có)
            const payload: UpdateNoteDTO = {
                id: note.id,
                title,
                content,
                status: note.status,
                folderId,
                tagsNames,
                ownerId: note.ownerId,
            };
            updateNote(payload, {
                onSuccess: () => { onClose(); }
            });
        };
    };

    // So sánh dữ liệu cũ với dữ liệu hiện tại
    const hasUnsavedChanges = () => {
        return (
            title !== note?.title ||
            content !== note?.content ||
            selectedFolder?.id !== note?.folder?.id ||
            JSON.stringify(selectedTags.map(t => t.id).sort()) !== JSON.stringify(note?.noteTags?.map(nt => nt.tag.id).sort())
        );
    };

    if (!visible || !note) return null;

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null} // ẩn footer mặc định
            centered
            width="95%" // tương tự w-[95%]
            destroyOnHidden // xoá state khi đóng để tránh lỗi Editor data cũ
            closable={false} // tắt nút mặc định để dùng ✕ custom
            keyboard // cho phép ESC đóng
            maskClosable={false} // ko cho phép click ngoài để đóng
            styles={{
                content: {
                    padding: 0,
                    height: "90vh", // đặt chiều cao modal
                    display: "flex",
                    flexDirection: "column",
                },
                body: {
                    padding: 0,
                    flex: 1, // để body chiếm hết chiều cao còn lại
                    height: "100%",
                    minHeight: "0",
                    overflowY: "hidden",
                    borderRadius: "1rem",
                    background: darkMode ? "#111827" : "#ffffff",
                    boxShadow:
                        "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                },
                mask: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                },
            }}
        >
            <div
                className={`relative w-full transition-all ${darkMode ? "text-gray-100" : "text-gray-800"
                    }`}
            >
                {/* ✕ nút đóng custom */}
                {hasUnsavedChanges() ? (
                    <Popconfirm
                        title="Unsaved changes"
                        description="You have unsaved changes. Are you sure you want to close without saving?"
                        okText="Close without saving"
                        cancelText="Cancel"
                        placement="bottomRight"
                        onConfirm={onClose}
                    >
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                            disabled={creatingNote || updatingNote}
                        >
                            <CloseOutlined />
                        </button>
                    </Popconfirm>
                ) :
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                        disabled={creatingNote || updatingNote}
                    >
                        <CloseOutlined />
                    </button>
                }


                <div className="flex flex-col h-[90vh] p-4">
                    {/* Title + Buttons */}
                    <div className="mb-4">
                        <TitleInput value={title} onChange={setTitle} darkMode={darkMode} />
                    </div>

                    {/* Folder + Tags */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <FolderSelect
                            selectedFolder={selectedFolder}
                            folders={folders}
                            onChange={setSelectedFolder}
                            darkMode={darkMode}
                        />
                        <TagSelect
                            selectedTags={selectedTags}
                            tags={tags}
                            onChange={setSelectedTags}
                            darkMode={darkMode}
                        />
                    </div>

                    {/* Nội dung */}
                    <EditorWrapper
                        noteId={note?.id || ""}
                        content={note?.content}
                        onChange={setContent}
                        darkMode={darkMode}
                    />

                    {/* ActionButtons */}
                    <div className='mt-2 flex justify-end'>
                        <ActionButtons
                            onSave={handleSave}
                            onClose={onClose}
                            darkMode={darkMode}
                            isCreating={creatingNote}
                            isUpdating={updatingNote}
                            confirmBeforeClose={hasUnsavedChanges()} // chỉ bật Popconfirm nếu có thay đổi
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NoteEditor;