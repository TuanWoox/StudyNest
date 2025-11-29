import React from "react";
import { theme } from "antd";
import { Note, Folder, Tag } from "@/types/note/notes";
import SidebarHeader from "./SidebarHeader";
import SearchAndViewControls from "./SearchAndViewControls";
import AllNotesView from "./views/AllNotesView";
import FolderView from "./views/FolderView";
import TagView from "./views/TagView";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

type ViewMode = "all" | "folder" | "tag";

interface NoteSidebarProps {
    notes: Note[];
    folders: Folder[];
    tags: Tag[];
    selectedNote: Note | null;
    handleOpenEditor: (note: Note) => void;
    handleCreateNote: (folder?: Folder) => void;
    setFolderModalMode: (mode: "create" | "update" | "delete") => void;
    setIsModalFolderVisible: (visible: boolean) => void;
    setSelectedFolder: (folder: Folder | null) => void;

    page: number;
    pageSize: number;
    totalElements: number;
    handleTableChange: (page: number, pageSize: number) => void;

    // folder pagination
    folderPage: number;
    folderPageSize: number;
    totalFolders: number;
    handleFolderChange: (page: number, pageSize: number) => void;

    // tag pagination
    tagPage: number;
    tagPageSize: number;
    totalTags: number;
    handleTagChange: (page: number, pageSize: number) => void;

    viewMode: ViewMode;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;

    searchNote: string;
    setSearchNote: React.Dispatch<React.SetStateAction<string>>;

    searchFolder: string;
    setSearchFolder: React.Dispatch<React.SetStateAction<string>>;

    searchTag: string;
    setSearchTag: React.Dispatch<React.SetStateAction<string>>;

    loadingNotes?: boolean;
    loadingFolders?: boolean;
    loadingTags?: boolean;

    onOpenFilter?: () => void;
}

const NoteSidebar: React.FC<NoteSidebarProps> = ({
    notes,
    folders,
    tags,
    selectedNote,
    handleOpenEditor,
    handleCreateNote,
    setFolderModalMode,
    setIsModalFolderVisible,
    setSelectedFolder,
    page,
    pageSize,
    totalElements,
    handleTableChange,
    folderPage,
    folderPageSize,
    totalFolders,
    handleFolderChange,
    tagPage,
    tagPageSize,
    totalTags,
    handleTagChange,
    viewMode,
    setViewMode,
    searchNote,
    setSearchNote,
    searchFolder,
    setSearchFolder,
    searchTag,
    setSearchTag,
    loadingNotes = false,
    loadingFolders = false,
    loadingTags = false,
    onOpenFilter,
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();

    const borderColor = `${token.colorPrimary}E0`; // 88% opacity

    return (
        <div className="w-full h-full overflow-y-auto px-6 pt-4 pb-5"
            style={{
                fontFamily: '"Courier New", monospace',
                backgroundColor: token.colorBgLayout,
                borderColor: darkMode ? '#212121' : borderColor,
                scrollbarWidth: "none",
            }}>
            <SidebarHeader onCreate={() => handleCreateNote()} />

            <SearchAndViewControls
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchNote={searchNote}
                setSearchNote={setSearchNote}
                searchFolder={searchFolder}
                setSearchFolder={setSearchFolder}
                searchTag={searchTag}
                setSearchTag={setSearchTag}
                onOpenFilter={onOpenFilter}
            />

            {viewMode === "all" && (
                <AllNotesView
                    notes={notes}
                    selectedNote={selectedNote}
                    handleOpenEditor={handleOpenEditor}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleTableChange={handleTableChange}
                    handleCreateNote={handleCreateNote}
                    isLoading={loadingNotes}
                />
            )}

            {viewMode === "folder" && (
                <FolderView
                    folders={folders}
                    selectedNote={selectedNote}
                    handleOpenEditor={handleOpenEditor}
                    handleCreateNote={handleCreateNote}
                    setFolderModalMode={setFolderModalMode}
                    setIsModalFolderVisible={setIsModalFolderVisible}
                    setSelectedFolder={setSelectedFolder}
                    folderPage={folderPage}
                    folderPageSize={folderPageSize}
                    totalFolders={totalFolders}
                    handleFolderChange={handleFolderChange}
                    isLoading={loadingFolders}
                />
            )}

            {viewMode === "tag" && (
                <TagView
                    tags={tags}
                    selectedNote={selectedNote}
                    handleOpenEditor={handleOpenEditor}
                    handleCreateNote={handleCreateNote}
                    tagPage={tagPage}
                    tagPageSize={tagPageSize}
                    totalTags={totalTags}
                    handleTagChange={handleTagChange}
                    isLoading={loadingTags}
                />
            )}
        </div>
    );
};

export default NoteSidebar;
