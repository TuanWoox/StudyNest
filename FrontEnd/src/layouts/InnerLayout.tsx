import { ProLayout } from "@ant-design/pro-components";
import { useNavigate, Outlet } from "react-router-dom";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Dropdown,
  Menu,
  ConfigProvider,
  Space,
  theme,
} from "antd";
import enUS from "antd/locale/en_US";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import logo from "@/assets/logo.svg";
import logoDarkmode from "@/assets/logo_darkmode.svg";
import { ERole } from "@/utils/enums/ERole";
import { adminMenus, userMenus } from "@/constants/menus";
import { logOut } from "@/store/authSlice";
import { toggleDarkMode, selectDarkMode } from "@/store/themeSlice";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import QuizJobBell from "@/components/QuizJobBell/QuizJobBell";

interface InnerLayoutProps {
  role: ERole;
}

const InnerLayout: React.FC<InnerLayoutProps> = ({
  role,
}) => {
  const navigate = useNavigate();
  const dispatch = useReduxDispatch();
  const darkMode = useReduxSelector(selectDarkMode);
  const queryClient = useQueryClient();

  // Update CSS variables based on theme
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.style.setProperty("--sidebar-bg", "#1A1A1A");
      root.style.setProperty("--menu-text", "#E5E7EB");
      root.style.setProperty("--menu-active-bg", "#818CF8");
      root.style.setProperty(
        "--menu-active-shadow",
        "4px 4px 0 rgba(99,102,241,0.5)"
      );
    } else {
      root.style.setProperty("--sidebar-bg", "#FCFCFC");
      root.style.setProperty("--menu-text", "#3b5bdb");
      root.style.setProperty("--menu-active-bg", "#3b5bdb");
      root.style.setProperty(
        "--menu-active-shadow",
        "4px 4px 0 rgba(59,91,219,0.5)"
      );
    }
  }, [darkMode]);

  const layoutTitle = role === ERole.Admin ? "Admin Panel" : "Study Nest";
  const menus = role === ERole.Admin ? adminMenus : userMenus;
  const path = role === ERole.Admin ? "admin" : "user";

  const handleLogout = () => {
    dispatch(logOut());
    window.localStorage.removeItem("accessToken");
    queryClient.clear();
    navigate("/homepage");
  };

  const menu = (
    <Menu
      items={[
        {
          key: "change-password",
          icon: <LockOutlined />,
          label: "Change Password",
          onClick: () => navigate(`/${path}/change-password`),
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Logout",
          danger: true,
          onClick: handleLogout,
        },
      ]}
    />
  );

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
      locale={enUS}
    >
      <div
        className={`transition-colors duration-500 ${darkMode ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-black"
          }`}
      >
        <ProLayout
          title={layoutTitle}
          logo={darkMode ? logoDarkmode : logo}
          fixSiderbar
          layout="mix"
          navTheme={darkMode ? "realDark" : "light"}
          location={{ pathname: window.location.pathname }}
          menu={{
            request: async () => menus,
          }}
          menuItemRender={(item, dom) => (
            <div onClick={() => navigate(item.path || "/")}>{dom}</div>
          )}
          style={{ height: "100dvh" }}
          contentStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
          }}
          rightContentRender={() => (
            <>
              <QuizJobBell />
              <Space style={{ marginLeft: 10 }}>
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => dispatch(toggleDarkMode())}
                  className={`relative flex items-center w-14 h-7 rounded-full transition-all duration-300 ${darkMode ? "bg-indigo-500" : "bg-[#3b5bdb]"
                    }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${darkMode ? "translate-x-7" : "translate-x-0"
                      }`}
                  />
                  <span className="absolute left-1.5 text-yellow-400">
                    <SunIcon className="w-4 h-4" />
                  </span>
                  <span className="absolute right-1.5 text-black">
                    <MoonIcon className="w-4 h-4" />
                  </span>
                </button>

                {/* User Avatar Dropdown */}
                <Dropdown overlay={menu} trigger={["click"]}>
                  <Avatar
                    size={40}
                    style={{
                      cursor: "pointer",
                      backgroundColor: darkMode ? "#6366F1" : "#3b5bdb",
                    }}
                    icon={<UserOutlined />}
                  />
                </Dropdown>
              </Space>
            </>
          )}
        >
          <div className="flex-1 flex min-h-0 overflow-hidden transition-colors duration-500">
            <Outlet />
          </div>
        </ProLayout>
      </div>
    </ConfigProvider>
  );
};

export default InnerLayout;