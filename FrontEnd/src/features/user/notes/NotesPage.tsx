import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Note, Folder } from "@/types/note/notes";
import { EStatus } from "@/utils/enums/EStatus";
import useGetAllFolder from "@/hooks/folderHook/useGetAllFolder";
import useGetAllTag from "@/hooks/tagHook/useGetAllTag";
import useGetAllNote from "@/hooks/noteHook/useGetAllNote";
import NoteSidebar from "./NoteSidebar/NoteSidebar";
import NoteEditor from "./NoteEditor/NoteEditor";
import useDeleteNote from "@/hooks/noteHook/useDeleteNote";
import ModalFolder from "./ModalFolder";
import Spinner from "@/components/Spinner/Spinner";

const NotesPage: React.FC = () => {
    const darkMode = useOutletContext<boolean>();

    const {
        data: noteData,
        isLoading: loadingNotes,
        isError: errorNotes,
    } = useGetAllNote({ pageSize: -1, pageNumber: 0 });

    const {
        data: tagData,
        isLoading: loadingTags,
        isError: errorTags,
    } = useGetAllTag({ pageSize: -1, pageNumber: 0 });

    // Gọi API lấy folders có phân trang
    const {
        data: folderData,
        isLoading: loadingFolders,
        isError: errorFolders,
    } = useGetAllFolder({ pageSize: -1, pageNumber: 0 });

    const { deleteNote } = useDeleteNote();

    const folders = folderData?.data || []; // `data` là mảng thư mục trong PagedData
    const tags = tagData?.data || [];
    const notes = noteData?.data || [];

    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

    const [folderModalMode, setFolderModalMode] = useState<"create" | "update" | "delete">("create");
    const [isModalFolderVisible, setIsModalFolderVisible] = useState(false);

    const [isEditorVisible, setIsEditorVisible] = useState(false);


    if (loadingNotes || loadingFolders || loadingTags)
        return <Spinner></Spinner>;
    if (errorNotes || errorFolders || errorTags) return <div className="p-4 text-red-500">Failed to load folders.</div>;

    const handleCreateNote = (folder?: Folder) => {
        const newNote: Note = {
            id: `note-${Date.now()}`,
            title: "Untitled Note",
            content: "",
            status: EStatus.InProgress,
            ownerId: "1",
            noteTags: [],
            folder: folder,
        };
        setSelectedNote(newNote);
        setIsEditorVisible(true);
    };

    const handleDeleteNote = (id: string) => {
        try {
            deleteNote(id);
        } catch (error) {
            console.error("Delete note failed:", error);
        }
    };

    const handleOpenEditor = (note: Note) => {
        setSelectedNote(note);
        setIsEditorVisible(true);
    };

    const handleCloseEditor = () => {
        setIsEditorVisible(false);
        setSelectedNote(null);
    };

    return (
        <div
            className={`flex flex-1 min-h-0 overflow-hidden transition-colors duration-300 ${darkMode ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"
                }`}
        >
            <NoteSidebar
                darkMode={darkMode}
                notes={notes}
                folders={folders} // dùng dữ liệu từ API
                tags={tags}
                selectedNote={selectedNote}
                handleOpenEditor={handleOpenEditor}
                handleCreateNote={handleCreateNote}
                setFolderModalMode={setFolderModalMode}
                setIsModalFolderVisible={setIsModalFolderVisible}
                setSelectedFolder={setSelectedFolder}              // truyền thêm
                handleDeleteNote={handleDeleteNote}
            />

            <ModalFolder
                visible={isModalFolderVisible}
                mode={folderModalMode}
                darkMode={darkMode}
                onCancel={() => setIsModalFolderVisible(false)}
                folder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
            />

            <NoteEditor
                visible={isEditorVisible}
                onClose={handleCloseEditor}
                darkMode={darkMode}
                note={selectedNote}
                folders={folders}
                tags={tags}
            />
        </div>
    );
};

export default NotesPage;
