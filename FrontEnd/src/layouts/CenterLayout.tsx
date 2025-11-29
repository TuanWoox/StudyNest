import React from "react";
import { Outlet } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { toggleDarkMode, selectDarkMode } from "@/store/themeSlice";


const CenterLayout: React.FC = () => {
  const darkMode = useReduxSelector(selectDarkMode);
  const dispatch = useReduxDispatch();

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: "monospace",
          colorPrimary: darkMode ? "#818CF8" : "#3b5bdb",
          colorPrimaryBg: darkMode ? "#1A1A1A" : "#FCFCFC",
          colorText: darkMode ? "#E5E7EB" : "#3b5bdb",
          colorBorder: darkMode ? "#818CF8" : "#3b5bdb",
          colorBgLayout: darkMode ? "#1A1A1A" : "#FCFCFC",
          borderRadius: 0,
          boxShadow: "3px 3px 0 #3b5bdb40",
          fontSize: 15,
        },
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: darkMode
            ? "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)"
            : "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
          fontFamily: "'Courier New', monospace",
          transition: "all 0.3s ease",
        }}
      >
        <Outlet />
        {/* FLOATING THEME TOGGLE BUTTON */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="fixed z-50 flex items-center gap-2 cursor-pointer"
          style={{
            top: "20px",
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
      </div>
    </ConfigProvider>
  );
};

export default CenterLayout;
