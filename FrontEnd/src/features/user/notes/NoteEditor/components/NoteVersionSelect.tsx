import { NoteVersion } from "@/types/note/notes";
import React, { useState } from "react";
import { Select, Modal, Button, theme } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";
import Editor from "@/components/Editor/Editor";
import { OutputBlockData } from "@editorjs/editorjs";

interface NoteVersionSelectProps {
    noteVersions: NoteVersion[];
    onSelectVersion: (content: string) => void;
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

const NoteVersionSelect: React.FC<NoteVersionSelectProps> = ({ noteVersions, onSelectVersion }) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token: antToken } = theme.useToken();
    const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState<OutputBlockData[]>([]);
    const [tempSelectedVersion, setTempSelectedVersion] = useState<NoteVersion | null>(null);

    // Sort versions by date (newest first)
    const sortedVersions = [...noteVersions].sort((a, b) => {
        const dateA = new Date(a.dateCreated || 0).getTime();
        const dateB = new Date(b.dateCreated || 0).getTime();
        return dateB - dateA;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        const fullDateTime = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
            hour: "2-digit",
            minute: "2-digit",
        });

        // Relative time for recent versions with full date/time
        if (diffMins < 1) return `Just now (${fullDateTime})`;
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago (${fullDateTime})`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago (${fullDateTime})`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago (${fullDateTime})`;

        // Absolute date for older versions
        return fullDateTime;
    };

    const handleVersionChange = (versionId: string) => {
        setSelectedVersionId(versionId);
        const version = sortedVersions.find((v) => v.id === versionId);
        if (version) {
            setTempSelectedVersion(version);
            setPreviewContent(parseContentToBlocks(version.content));
            setPreviewVisible(true);
        }
    };

    const handleApply = () => {
        if (tempSelectedVersion) {
            onSelectVersion(tempSelectedVersion.content);
            setPreviewVisible(false);
        }
    };

    const borderColor = `${antToken.colorPrimary}E0`;
    const shadowColor = `${antToken.colorPrimary}55`;
    const backgroundColor = darkMode ? "#1E1E1E" : "#FFFDF8";

    if (!noteVersions || noteVersions.length === 0) {
        return null;
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <Select
                        placeholder="Select a version to preview"
                        value={selectedVersionId}
                        onChange={handleVersionChange}
                        style={{
                            minWidth: 400,
                            width: "100%",
                            maxWidth: 600,
                            fontFamily: '"Courier New", monospace',
                        }}
                        className={darkMode ? "dark-select" : ""}
                        popupMatchSelectWidth={false}
                    >
                        {sortedVersions.map((version, index) => (
                            <Select.Option key={version.id} value={version.id}>
                                <div className="flex justify-between items-center gap-3">
                                    <span className="font-medium">
                                        {formatDate(version.dateCreated)}
                                    </span>
                                    {index === 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                            Latest
                                        </span>
                                    )}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <HistoryOutlined />
                        <span>Version Preview</span>
                    </div>
                }
                open={previewVisible}
                onCancel={() => {
                    setPreviewVisible(false);
                    setSelectedVersionId(undefined);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setPreviewVisible(false);
                            setSelectedVersionId(undefined);
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="apply"
                        type="primary"
                        onClick={handleApply}
                        style={{
                            fontFamily: '"Courier New", monospace',
                            border: `1.5px solid ${borderColor}`,
                            boxShadow: `3px 3px 0 ${shadowColor}`,
                        }}
                    >
                        Apply Version
                    </Button>,
                ]}
                width="80%"
                centered
                styles={{
                    content: {
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor,
                        boxShadow: `6px 6px 0 ${shadowColor}`,
                        fontFamily: '"Courier New", monospace',
                        maxHeight: "80vh",
                    },
                    body: {
                        maxHeight: "60vh",
                        overflowY: "auto",
                    },
                }}
            >
                <div className="mt-4">
                    <Editor
                        holderElementId={`preview-editor-${selectedVersionId}`}
                        data={previewContent}
                        onChangeOutside={() => { }}
                        readOnly={true}
                    />
                </div>
            </Modal>
        </>
    );
};

export default NoteVersionSelect;
