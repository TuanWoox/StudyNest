import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { theme } from 'antd';
import { Folder } from '@/types/note/notes';
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface FolderSelectProps {
    selectedFolder?: Folder;
    folders: Folder[];
    onChange: (folder?: Folder) => void;
    // darkMode: boolean;
}

const FolderSelect: React.FC<FolderSelectProps> = ({
    selectedFolder, folders, onChange,
    // darkMode
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();

    const primary88 = `${token.colorPrimary}E0`; // 88%
    const primary33 = `${token.colorPrimary}55`; // 33%

    return (
        <div
            className="flex-1 transition-all duration-300"
            style={{
                fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
            }}
        >
            {/* Label retro */}
            <label
                className="block text-sm font-semibold mb-2 transition-colors duration-300"
                style={{
                    color: darkMode ? "#D1D5DB" : primary88,
                    letterSpacing: "0.5px",
                }}
            >
                📁 Folder
            </label>

            <CreatableSelect
                isClearable
                placeholder="Choose a folder or create new..."
                value={
                    selectedFolder
                        ? { label: selectedFolder.folderName, value: selectedFolder.id }
                        : null
                }
                options={[
                    { label: "None", value: "" },
                    ...folders.map((f) => ({ label: f.folderName, value: f.id })),
                ]}
                onChange={(option) => {
                    if (!option || option.value === "") {
                        onChange(undefined);
                    } else {
                        const exists = folders.find(
                            (f) => f.id === option.value || f.folderName === option.label
                        );
                        const folder =
                            exists || {
                                id: `temp-${Date.now()}`,
                                folderName: option.label,
                                ownerId: "1",
                            };
                        onChange(folder);
                    }
                }}
                styles={{
                    menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                        position: "absolute",
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                        border: `1px solid ${primary88}`,
                        boxShadow: `3px 3px 0 ${primary33}`,
                        borderRadius: 0,
                        zIndex: 10000,
                        position: "absolute",
                    }),
                    menuList: (base) => ({
                        ...base,
                        maxHeight: "200px",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                    }),
                    control: (base, state) => ({
                        ...base,
                        border: `1px solid ${state.isFocused ? token.colorPrimary : primary88}`,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                        borderRadius: 0,
                        fontSize: "15px",
                        minHeight: "52px",
                        fontFamily: "'Courier New', monospace",
                        color: darkMode ? "#F9FAFB" : "#222",
                        boxShadow: state.isFocused
                            ? `3px 3px 0 ${primary33}`
                            : `2px 2px 0 ${primary33}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                            borderColor: token.colorPrimary,
                            boxShadow: `4px 4px 0 ${primary33}`,
                        },
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                            ? darkMode
                                ? "#374151"
                                : "#E5E7EB"
                            : darkMode
                                ? "#1e1e1e"
                                : "#fafafa",
                        color: darkMode
                            ? state.isFocused
                                ? "#FFFFFF"
                                : "#D1D5DB"
                            : state.isFocused
                                ? "#111827"
                                : "#374151",
                        fontFamily: "'Courier New', monospace",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: darkMode ? "#9CA3AF" : "#6B7280",
                        fontFamily: "'Courier New', monospace",
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: darkMode ? "#F3F4F6" : "#111827",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 500,
                    }),
                }}
                menuPortalTarget={document.body}
            />
        </div>
    );
};

export default FolderSelect;
