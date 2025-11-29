import React, { useEffect, useState } from "react";
import { Note, Folder } from "@/types/note/notes";
import { EStatus } from "@/utils/enums/EStatus";
import useGetAllFolder from "@/hooks/folderHook/useGetAllFolder";
import useGetAllTag from "@/hooks/tagHook/useGetAllTag";
import useGetAllNote from "@/hooks/noteHook/useGetAllNote";
import NoteSidebar from "./components/NoteSidebar/NoteSidebar";
import NoteEditor from "../NoteEditor/NoteEditor";
import ModalFolder from "./components/ModalFolder";
import NoteFilterModal from "./components/NoteFilterModal";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";
import useDebounce from "@/hooks/common/useDebounce";
import { SortOrderType } from "@/constants/sortOrderType";
import { Dayjs } from "dayjs";

type ViewMode = "all" | "folder" | "tag";

const NotesPage: React.FC = () => {
    // const darkMode = useOutletContext<boolean>();
    const darkMode = useReduxSelector(selectDarkMode);
    const [viewMode, setViewMode] = useState<ViewMode>("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [folderPage, setFolderPage] = useState(1);
    const [folderPageSize, setFolderPageSize] = useState(10); // số folder/trang
    const [tagPage, setTagPage] = useState(1);
    const [tagPageSize, setTagPageSize] = useState(10); // số tag/trang
    const [searchNote, setSearchNote] = useState("");
    const [searchFolder, setSearchFolder] = useState("");
    const [searchTag, setSearchTag] = useState("");
    const debouncedSearchNote = useDebounce(searchNote, 500);
    const debouncedSearchFolder = useDebounce(searchFolder, 500);
    const debouncedSearchTag = useDebounce(searchTag, 500);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    // Filter Note
    const [createdFilterRange, setCreatedFilterRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [modifiedFilterRange, setModifiedFilterRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    // Sort Note
    const [sortField, setSortField] = useState<"dateCreated" | "dateModified" | "title">("dateCreated");
    const [sortDir, setSortDir] = useState<SortOrderType>(SortOrderType.DESC);

    const {
        data: noteData,
        isLoading: loadingNotes,
        isError: errorNotes,
    } = useGetAllNote({
        pageSize,
        pageNumber: page - 1,
        searchTerm: debouncedSearchNote,
        sortField,
        sortDir,
        createdRange: createdFilterRange,
        modifiedRange: modifiedFilterRange,
    });

    const {
        data: tagData,
        isLoading: loadingTags,
        isError: errorTags,
    } = useGetAllTag({ pageSize: tagPageSize, pageNumber: tagPage - 1, searchTerm: debouncedSearchTag });

    const {
        data: folderData,
        isLoading: loadingFolders,
        isError: errorFolders,
    } = useGetAllFolder({ pageSize: folderPageSize, pageNumber: folderPage - 1, searchTerm: debouncedSearchFolder });

    const folders = folderData?.data || []; // `data` là mảng thư mục trong PagedData
    const tags = tagData?.data || [];
    const notes = noteData?.data || [];

    const totalElements = noteData?.page.totalElements || 0;

    const handleTableChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
        setViewMode("all");
    };

    const totalFolders = folderData?.page.totalElements || folders.length;
    const totalTags = tagData?.page.totalElements || tags.length;

    const handleFolderChange = (newPage: number, newPageSize: number) => {
        setFolderPage(newPage);
        setFolderPageSize(newPageSize);
        setViewMode("folder");
    };

    const handleTagChange = (newPage: number, newPageSize: number) => {
        setTagPage(newPage);
        setTagPageSize(newPageSize);
        setViewMode("tag");
    };

    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

    const [folderModalMode, setFolderModalMode] = useState<"create" | "update" | "delete">("create");
    const [isModalFolderVisible, setIsModalFolderVisible] = useState(false);

    const [isEditorVisible, setIsEditorVisible] = useState(false);

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

    const handleOpenEditor = (note: Note) => {
        setSelectedNote(note);
        setIsEditorVisible(true);
    };

    const handleCloseEditor = () => {
        setIsEditorVisible(false);
        setSelectedNote(null);
    };

    useEffect(() => {
        if (!noteData) return;

        const total = noteData.page.totalElements;
        const totalPages = Math.ceil(total / pageSize);

        // Nếu page > totalPages → lùi về trang cuối đúng
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }

        // Nếu totalPages = 0 → reset về page 1
        if (totalPages === 0 && page !== 1) {
            setPage(1);
        }
    }, [noteData, page, pageSize]);


    useEffect(() => {
        if (!folderData) return;

        const total = folderData.page.totalElements;
        const totalPages = Math.ceil(total / folderPageSize);

        if (folderPage > totalPages && totalPages > 0) {
            setFolderPage(totalPages);
        }

        if (totalPages === 0 && folderPage !== 1) {
            setFolderPage(1);
        }
    }, [folderData, folderPage, folderPageSize]);

    useEffect(() => {
        if (!tagData) return;

        const total = tagData.page.totalElements;
        const totalPages = Math.ceil(total / tagPageSize);

        if (tagPage > totalPages && totalPages > 0) {
            setTagPage(totalPages);
        }

        if (totalPages === 0 && tagPage !== 1) {
            setTagPage(1);
        }
    }, [tagData, tagPage, tagPageSize]);

    if (errorNotes || errorFolders || errorTags) return <div className="p-4 text-red-500">Failed to load folders.</div>;
    return (
        <div
            className={`flex flex-1 min-h-0 overflow-hidden transition-colors duration-300 ${darkMode ? "bg-[#0f0f0f] text-gray-100" : "bg-gray-50 text-gray-900"
                }`}
        >
            <NoteSidebar
                notes={notes}
                folders={folders}
                tags={tags}
                selectedNote={selectedNote}
                handleOpenEditor={handleOpenEditor}
                handleCreateNote={handleCreateNote}
                setFolderModalMode={setFolderModalMode}
                setIsModalFolderVisible={setIsModalFolderVisible}
                setSelectedFolder={setSelectedFolder}

                // thêm 3 props này
                page={page}
                pageSize={pageSize}
                totalElements={totalElements}
                handleTableChange={handleTableChange}

                // pagination folder & tag
                folderPage={folderPage}
                folderPageSize={folderPageSize}
                totalFolders={totalFolders}
                handleFolderChange={handleFolderChange}

                tagPage={tagPage}
                tagPageSize={tagPageSize}
                totalTags={totalTags}
                handleTagChange={handleTagChange}

                viewMode={viewMode}
                setViewMode={setViewMode}

                searchNote={searchNote}
                setSearchNote={setSearchNote}

                searchFolder={searchFolder}
                setSearchFolder={setSearchFolder}

                searchTag={searchTag}
                setSearchTag={setSearchTag}

                loadingNotes={loadingNotes}
                loadingFolders={loadingFolders}
                loadingTags={loadingTags}

                onOpenFilter={() => setIsFilterModalOpen(true)}
            />

            {/* Filter modal */}
            <NoteFilterModal
                open={isFilterModalOpen}
                defaultSortBy={sortField}
                defaultSortOrder={sortDir}
                defaultCreatedRange={createdFilterRange}
                defaultModifiedRange={modifiedFilterRange}
                onCancel={() => setIsFilterModalOpen(false)}
                onApply={({ sortBy, sortOrder, createdRange, modifiedRange }) => {
                    setSortField((sortBy as "dateCreated" | "dateModified" | "title") ?? "dateCreated");
                    setSortDir((sortOrder as SortOrderType) ?? SortOrderType.DESC);
                    setCreatedFilterRange(createdRange ?? [null, null]);
                    setModifiedFilterRange(modifiedRange ?? [null, null]);
                    setPage(1); // reset về trang đầu
                    setIsFilterModalOpen(false);
                }}
            />

            <ModalFolder
                visible={isModalFolderVisible}
                mode={folderModalMode}
                // darkMode={darkMode}
                onCancel={() => setIsModalFolderVisible(false)}
                folder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
            />

            <NoteEditor
                visible={isEditorVisible}
                onClose={handleCloseEditor}
                // darkMode={darkMode}
                note={selectedNote}
                folders={folders}
                tags={tags}
            />
        </div>
    );
};

export default NotesPage;
