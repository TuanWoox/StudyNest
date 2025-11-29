export interface Folder {
    id: string;
    folderName: string;
    ownerId: string;
    notes?: Note[];
    dateCreated?: string;
    dateModified?: string;
    deleted?: boolean;
}

export interface Tag {
    id: string;
    name: string;
    noteTags?: NoteTag[];
    dateCreated?: string;
    dateModified?: string;
    deleted?: boolean;
}

export interface NoteTag {
    noteId: string;
    tagId: string;
    tag: Tag;
    note?: Note; // Chỉ có ở ViewTag API
    dateCreated?: string;
    dateModified?: string;
    deleted?: boolean;
}

export interface NoteVersion {
    id: string;
    content: string;
    noteId: string;
    dateCreated?: string;
    dateModified?: string;
    deleted?: boolean;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    status: string;
    ownerId: string;
    folderId?: string;
    folder?: Folder;
    noteTags: NoteTag[];
    noteVersions: NoteVersion[];
    dateCreated?: string;
    dateModified?: string;
    deleted?: boolean;
}

export interface CreateNoteDTO {
    id?: string; // BaseKey có id? nếu cần
    title: string;
    content: string;
    status: string;
    folderId?: string | null;
    tagsNames?: string[]; // backend nhận List<string> TagsNames
    ownerId?: string;
}

export interface UpdateNoteDTO extends CreateNoteDTO {
    id: string;
}

export interface CreateFolderDTO {
    id?: string;
    folderName: string;
    ownerId?: string;
}

export interface UpdateFolderDTO extends CreateFolderDTO {
    id: string;
}

export interface CreateTagDTO {
    name: string;
}

export interface UpdateTagDTO extends CreateTagDTO {
    id: string;
}