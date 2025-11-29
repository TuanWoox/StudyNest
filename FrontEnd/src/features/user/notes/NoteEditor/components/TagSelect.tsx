import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { theme } from 'antd';
import { Tag } from '@/types/note/notes';
import { components } from 'react-select';
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

const CustomValueContainer = (props: any) => (
    <components.ValueContainer {...props}>
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                overflowY: "auto",
                maxHeight: "40px",
                paddingRight: "4px",
                scrollbarWidth: "none",
            }}
        >
            {props.children}
        </div>
    </components.ValueContainer>
);

interface TagSelectProps {
    selectedTags: Tag[];
    tags: Tag[];
    onChange: (tags: Tag[]) => void;
    // darkMode: boolean;
}

const TagSelect: React.FC<TagSelectProps> = ({ selectedTags, tags, onChange,
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
                🏷️ Tags
            </label>

            <CreatableSelect
                isMulti
                components={{ ValueContainer: CustomValueContainer }}
                placeholder="Add or create tags..."
                value={selectedTags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                }))}
                options={tags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                }))}
                onChange={(selectedOptions) => {
                    const newTags = selectedOptions.map((opt) => {
                        const existing = tags.find(
                            (t) => t.id === opt.value || t.name === opt.label
                        );
                        return existing || { id: `temp-${opt.label}`, name: opt.label };
                    });
                    onChange(newTags);
                }}
                styles={{
                    menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                        position: "absolute",
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa", // FIXED
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa", // FIXED
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
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa", // FIXED
                    }),
                    control: (base, state) => ({
                        ...base,
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        minHeight: "52px",
                        maxHeight: "80px",
                        overflowY: "auto",
                        border: `1px solid ${state.isFocused ? token.colorPrimary : primary88}`,
                        backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                        borderRadius: 0,
                        fontSize: "15px",
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
                    multiValue: (base) => ({
                        ...base,
                        background: darkMode
                            ? "linear-gradient(135deg, #1E40AF, #3B82F6)"
                            : "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                        padding: "2px 6px",
                        margin: "2px",
                        border: `1px solid ${primary88}`,
                        boxShadow: `1px 1px 0 ${primary33}`,
                    }),
                    multiValueLabel: (base) => ({
                        ...base,
                        color: darkMode ? "#F3F4F6" : "#1E3A8A",
                        fontWeight: 500,
                        fontSize: "14px",
                        fontFamily: "'Courier New', monospace",
                    }),
                    multiValueRemove: (base) => ({
                        ...base,
                        color: darkMode ? "#BFDBFE" : "#3B82F6",
                        "&:hover": {
                            backgroundColor: darkMode
                                ? "rgba(239,68,68,0.2)"
                                : "rgba(239,68,68,0.1)",
                            color: "#EF4444",
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
                                : "#fafafa", // FIXED
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
                }}
                menuPortalTarget={document.body}
            />
        </div>
    );
};

export default TagSelect;
