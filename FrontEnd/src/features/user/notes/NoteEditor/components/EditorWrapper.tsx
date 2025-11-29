import React from 'react';
import Editor from '@/components/Editor/Editor';
import { OutputBlockData } from "@editorjs/editorjs";
import { theme } from 'antd';
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface EditorWrapperProps {
    noteId: string;
    content: string;
    onChange: (content: string) => void;
    versionKey?: number;
}

const parseContentToBlocks = (content: string): OutputBlockData[] => {
    try {
        const parsed = JSON.parse(content);
        if (parsed.blocks) return parsed.blocks;
    } catch {
        return [{ type: "paragraph", data: { text: content } }];
    }
    return [];
};

const EditorWrapper: React.FC<EditorWrapperProps> = ({
    noteId,
    content,
    onChange,
    versionKey = 0,
    // darkMode
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();

    const primary88 = `${token.colorPrimary}E0`; // 88% opacity
    const primary33 = `${token.colorPrimary}55`; // 33% opacity

    return (
        <div
            className={`
                h-full transition-all duration-300
                ${darkMode ? "retro-dark" : "retro-light"}
            `}
            style={{
                fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
                border: `1.5px solid ${primary88}`,
                backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                boxShadow: `4px 4px 0 ${primary33}`,
                overflow: "auto",
                scrollbarWidth: "none",
                transition: "all 0.25s ease-in-out",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `6px 6px 0 ${primary33}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = token.colorPrimary;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 ${primary33}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = primary88;
            }}
        >
            {/* Inner padding để nội dung Editor thoáng */}
            <div
                className="p-6"
                style={{
                    minHeight: "100%",
                    color: darkMode ? "#E5E7EB" : "#222",
                }}
            >
                <Editor
                    key={`editor-${noteId}-${versionKey}`}
                    holderElementId={`editorjs-${noteId}`}
                    data={parseContentToBlocks(content)}
                    onChangeOutside={(outputData) => onChange(JSON.stringify(outputData))}
                />
            </div>
        </div>
    );
};

export default EditorWrapper;
