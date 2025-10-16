import React from 'react';
import { Input, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface TitleInputProps {
    value: string;
    onChange: (val: string) => void;
    darkMode: boolean;
}

const TitleInput: React.FC<TitleInputProps> = ({ value, onChange, darkMode }) => {
    return (
        <div className="flex-1 mr-6 group relative" title="Click to edit title" role="group">
            <Input
                placeholder="Start writing your thoughts..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Note title"
                className={`${darkMode ? "dark" : "light"} cursor-text`}
                style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    lineHeight: "1.5",
                    border: "none",
                    boxShadow: "none",
                    background: "transparent",
                    padding: "0",
                    color: darkMode ? "#FFFFFF" : "#37352F",
                    fontFamily: "inherit",
                    outline: "none",
                }}
            />

            {/* underline: expand on hover or when input is focused */}
            <div
                className={`h-0.5 w-full group-hover:bg-blue-400 group-focus-within:bg-blue-400 transition-all duration-300 ${darkMode ? 'bg-[#374151]' : 'bg-[#E5E7EB]'}`}
            />

            {/* edit icon appears on hover/focus */}
            <Tooltip title="Edit title" mouseEnterDelay={0.15}>
                <EditOutlined
                    className="absolute right-0 top-5 text-gray-400"
                    style={{ fontSize: 18, pointerEvents: 'none' }}
                    aria-hidden="true"
                />
            </Tooltip>

            <div className={`mt-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Click to edit the title
            </div>
        </div>
    );
};

export default TitleInput;
