import React from 'react';
import { Input, Tooltip, theme } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";

interface TitleInputProps {
    value: string;
    onChange: (val: string) => void;
    // darkMode: boolean;
}

const TitleInput: React.FC<TitleInputProps> = ({
    value,
    onChange,
    // darkMode 
}) => {
    const darkMode = useReduxSelector(selectDarkMode);
    const { token } = theme.useToken();

    // màu chủ đạo từ token
    const primary88 = `${token.colorPrimary}E0`; // 88% opacity
    const primary33 = `${token.colorPrimary}55`; // 33% opacity

    return (
        <div
            className={`
                flex-1 relative group transition-all duration-300
            `}
            title="Click to edit title"
            role="group"
            style={{
                fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
                border: `1px solid ${primary88}`,
                backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                padding: "16px 20px",
                boxShadow: `4px 4px 0 ${primary33}`,
                transition: "all 0.3s ease",
            }}
            // Tailwind hover thêm border + shadow sáng hơn
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `6px 6px 0 ${primary33}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = token.colorPrimary;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `4px 4px 0 ${primary33}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = primary88;
            }}
        >
            <Input
                placeholder="Start writing your thoughts..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Note title"
                bordered={false}
                className="cursor-text bg-transparent"
                style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    lineHeight: "1.4",
                    color: darkMode ? "#F9FAFB" : "#222",
                    background: "transparent",
                    padding: 0,
                    fontFamily: "'Courier New', 'IBM Plex Mono', monospace",
                }}
            />

            {/* gạch chân mặc định */}
            <div
                className="absolute left-5 right-5 bottom-3 h-[2px] transition-all duration-300"
                style={{
                    backgroundColor: darkMode ? "#333" : "#e0e0e0",
                }}
            />

            {/* gạch chân highlight khi hover / focus */}
            <div
                className="absolute left-5 right-5 bottom-3 h-[2px] scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 origin-left transition-transform duration-300"
                style={{
                    backgroundColor: primary88,
                }}
            />

            {/* icon edit */}
            <Tooltip title="Edit title" mouseEnterDelay={0.15}>
                <EditOutlined
                    className="absolute right-5 top-5 transition-colors duration-300 group-hover:text-primary"
                    style={{
                        fontSize: 18,
                        color: darkMode ? "#9CA3AF" : "#6B7280",
                        transition: "color 0.3s ease",
                        pointerEvents: "none",
                    }}
                    aria-hidden="true"
                />
            </Tooltip>

            <div
                className="mt-2 text-xs transition-colors duration-300"
                style={{
                    color: darkMode ? "#A1A1AA" : "#6B7280",
                    fontFamily: "'Courier New', monospace",
                }}
            >
                Click to edit the title
            </div>
        </div>
    );
};

export default TitleInput;
