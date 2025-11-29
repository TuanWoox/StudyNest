import React from "react";
import { Input, Button, Space, Tooltip, theme } from "antd";
import { SearchOutlined, FileTextOutlined, FolderOutlined, TagsOutlined, FilterOutlined } from "@ant-design/icons";

type ViewMode = "all" | "folder" | "tag";

interface Props {
    viewMode: ViewMode;
    setViewMode: (m: ViewMode) => void;
    searchNote: string;
    setSearchNote: React.Dispatch<React.SetStateAction<string>>;

    searchFolder: string;
    setSearchFolder: React.Dispatch<React.SetStateAction<string>>;

    searchTag: string;
    setSearchTag: React.Dispatch<React.SetStateAction<string>>;

    onOpenFilter?: () => void;
}

const SearchAndViewControls: React.FC<Props> = ({
    viewMode,
    setViewMode,
    searchNote,
    setSearchNote,
    searchFolder,
    setSearchFolder,
    searchTag,
    setSearchTag,
    onOpenFilter
}) => {
    const { token } = theme.useToken();
    const borderColor = `${token.colorPrimary}E0`;
    const shadowColor = `${token.colorPrimary}55`;

    return (
        <div
            className="mb-6 p-5 transition-all duration-300"
            style={{
                border: `1px solid ${borderColor}`,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                fontFamily: '"Courier New", monospace'
            }}
        >
            <div className="flex justify-between gap-4 mb-3">
                <Input
                    placeholder={viewMode === 'all' ? 'Search notes...' : viewMode === 'folder' ? 'Search folders...' : 'Search tags...'}
                    prefix={<SearchOutlined />}
                    value={viewMode === 'all' ? searchNote : viewMode === 'folder' ? searchFolder : searchTag}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (viewMode === 'all') {
                            setSearchNote(v);
                        } else if (viewMode === 'folder') {
                            setSearchFolder(v);
                        } else {
                            setSearchTag(v);
                        }
                    }}
                    style={{
                        border: `1px solid ${borderColor}`,
                        boxShadow: `2px 2px 0 ${shadowColor}`,
                        fontFamily: '"Courier New", monospace',
                        fontSize: 15,
                        borderRadius: 0
                    }}
                />
                <Button
                    type="default"
                    icon={<FilterOutlined />}
                    onClick={() => onOpenFilter?.()}
                    style={{
                        fontWeight: 600,
                        boxShadow: `3px 3px 0 ${shadowColor}`,
                        border: `1px solid ${borderColor}`,
                        fontFamily: '"Courier New", monospace',
                        borderRadius: 0,
                        fontSize: 20,
                        lineHeight: 0.75
                    }}
                >
                    Filter
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                <Space size="middle">
                    {[
                        { icon: <FileTextOutlined />, mode: 'all', title: 'All Notes' },
                        { icon: <FolderOutlined />, mode: 'folder', title: 'Folder View' },
                        { icon: <TagsOutlined />, mode: 'tag', title: 'Tag View' },
                    ].map(({ icon, mode, title }) => (
                        <Tooltip key={mode} title={title} getPopupContainer={(trigger) => trigger.parentElement!}>
                            <Button
                                icon={icon}
                                onClick={() => setViewMode(mode as ViewMode)}
                                type={viewMode === mode ? 'primary' : 'default'}
                                style={{
                                    border: `1px solid ${borderColor}`,
                                    boxShadow: `2px 2px 0 ${shadowColor}`,
                                    transition: 'all 0.25s ease',
                                    borderRadius: 0
                                }}
                            />
                        </Tooltip>
                    ))}
                </Space>
            </div>
        </div>
    );
};

export default SearchAndViewControls;
