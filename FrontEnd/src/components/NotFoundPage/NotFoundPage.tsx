import React from "react";
import { Card, Space, Button, Typography, ConfigProvider, theme } from "antd";
import { HomeOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { toggleDarkMode, selectDarkMode } from "@/store/themeSlice";
import useAntDesignTheme from "@/hooks/common/useAntDesignTheme";
import logo from "@/assets/404.svg";
import logoDarkMode from "@/assets/404_darkmode.svg";

const { Title, Text } = Typography;

const NotFoundComponent: React.FC = () => {
    const { primaryColor, borderColor, shadowColor, bgColor } = useAntDesignTheme();
    const darkMode = useReduxSelector(selectDarkMode);
    const navigate = useNavigate();

    return (
        <div
            style={{
                height: "100vh",
                backgroundColor: bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div className="px-4">
                <Card
                    className="w-full shadow-xl"
                    style={{
                        border: `1.5px solid ${borderColor}`,
                        boxShadow: `4px 4px 0 ${shadowColor}`,
                        background: bgColor,
                        borderRadius: 0
                    }}
                >
                    <Space
                        direction="vertical"
                        size="large"
                        className="w-full text-center py-10 sm:py-12 lg:py-16"
                        style={{ alignItems: "center" }}
                    >
                        <img
                            src={darkMode ? logoDarkMode : logo}
                            alt="404"
                            style={{
                                width: 120,
                                height: "auto",
                                userSelect: "none",
                            }}
                        />
                        <div style={{ maxWidth: 720 }}>
                            <Title
                                level={2}
                                style={{
                                    marginBottom: 8,
                                    fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
                                    fontWeight: 600,
                                }}
                            >
                                Page Not Found
                            </Title>
                            <Text
                                type="secondary"
                                style={{
                                    display: "block",
                                    lineHeight: 1.6,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                The page you are looking for doesn't exist or has been moved. Check the URL or return to the homepage.
                            </Text>
                        </div>

                        <Space size="middle" className="mt-4">
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                onClick={() => navigate("/")}
                                style={{
                                    border: `1.5px solid ${primaryColor}`,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    boxShadow: `3px 3px 0 ${shadowColor}`,
                                }}                            >
                                Go to Home
                            </Button>
                            <Button
                                onClick={() => navigate(-1)}
                                style={{
                                    border: `1.5px solid ${primaryColor}`,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    boxShadow: `3px 3px 0 ${shadowColor}`,
                                }}
                            >
                                Go back
                            </Button>
                        </Space>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export function NotFoundPage() {
    const darkMode = useReduxSelector(selectDarkMode);
    const dispatch = useReduxDispatch();

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    fontFamily: "'Courier New', monospace",
                    colorPrimary: darkMode ? "#818CF8" : "#3b5bdb",
                    colorPrimaryBg: darkMode ? "#1A1A1A" : "#FCFCFC",
                    colorText: darkMode ? "#E5E7EB" : "#3b5bdb",
                    colorBorder: darkMode ? "#818CF8" : "#3b5bdb",
                    colorBgLayout: darkMode ? "#1A1A1A" : "#FCFCFC",
                    borderRadius: 0,
                    fontSize: 15,
                },
            }}
        >
            <NotFoundComponent />
            {/* FLOATING THEME TOGGLE BUTTON */}
            <button
                onClick={() => dispatch(toggleDarkMode())}
                className="fixed z-50 flex items-center gap-2 cursor-pointer"
                style={{
                    bottom: "60px",
                    right: "20px",
                    padding: "10px 14px",
                    border: `1.5px solid ${darkMode ? "#818CF8" : "#3b5bdb"}`,
                    backgroundColor: `${darkMode ? "#1A1A1A" : "#FCFCFC"}`,
                    color: `${darkMode ? "#E5E7EB" : "#3b5bdb"}`,
                    boxShadow: `3px 3px 0 ${darkMode ? "#818CF8" : "#3b5bdb"}55`,
                    fontFamily: "'IBM Plex Mono', monospace",
                    transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
                {darkMode ? <SunOutlined /> : <MoonOutlined />}
            </button>
        </ConfigProvider>
    )
}