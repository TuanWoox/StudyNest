import React from "react";
import { Button, Card, Divider, ConfigProvider, theme } from "antd";
import { BookOutlined, BarChartOutlined, RobotOutlined, MailOutlined, PhoneOutlined, ExclamationCircleOutlined, CheckCircleOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectRole } from "@/store/authSlice";
import { toggleDarkMode, selectDarkMode } from "@/store/themeSlice";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { useNavigate } from "react-router-dom";
import { ERole } from "@/utils/enums/ERole";
import { useAntDesignTheme } from "@/hooks/common";
import logo from "@/assets/logo.svg";
import logoDarkmode from "@/assets/logo_darkmode.svg";

const HomePage: React.FC = () => {
    const { token, borderColor, shadowColor, bgColor, textColor } = useAntDesignTheme();
    const darkMode = useReduxSelector(selectDarkMode);
    const role = useReduxSelector(selectRole); // nếu user logged in, role tồn tại
    const navigate = useNavigate();

    const cardStyle: React.CSSProperties = {
        border: `1.5px solid ${borderColor}`,
        boxShadow: `4px 4px 0 ${shadowColor}`,
        backgroundColor: bgColor,
        fontFamily: "'IBM Plex Mono', monospace",
        transition: "all 0.3s ease",
    };

    // Handle redirect if user reloads the page

    const onNavigateSite = () => {
        switch (role) {
            case ERole.User:
                navigate('/user/notes');
                break;
            case ERole.Admin:
                navigate('/admin/dashboard');
                break;
        }
    }


    return (
        <div
            className="w-full flex flex-col items-center justify-center"
            style={{
                fontFamily: "'IBM Plex Mono', monospace",
                backgroundColor: bgColor,
                color: textColor
            }}
        >

            {/* Header */}
            <header
                className="w-full flex flex-row justify-between items-center gap-4 sm:gap-0 px-2 sm:px-8 py-4 backdrop-blur-md"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    borderBottom: `1.5px solid ${borderColor}`,
                    backgroundColor: `${token.colorBgLayout}DD`,
                }}
            >
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <div
                        className="flex items-center justify-center w-7 h-7 overflow-hidden"
                    >
                        <img
                            src={darkMode ? logoDarkmode : logo}
                            alt="logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: token.colorText }}
                    >
                        Study Nest
                    </h1>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                    {role ? (
                        <Button
                            size="middle"
                            style={{
                                border: `1.5px solid ${token.colorPrimary}`,
                                fontFamily: "'IBM Plex Mono', monospace",
                                boxShadow: `3px 3px 0 ${token.colorPrimary}33`,
                            }}
                            onClick={onNavigateSite}
                            className="hover:-translate-y-[2px]"
                        >
                            Go To Your Site
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="middle"
                                style={{
                                    border: `1.5px solid ${token.colorPrimary}`,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    boxShadow: `3px 3px 0 ${token.colorPrimary}33`,
                                }}
                                onClick={() => navigate("/login")}
                                className="hover:-translate-y-[2px]"
                            >
                                Log in
                            </Button>
                            <Button
                                size="middle"
                                type="primary"
                                style={{
                                    backgroundColor: token.colorPrimary,
                                    border: "none",
                                    fontFamily: "'IBM Plex Mono', monospace",
                                    boxShadow: `3px 3px 0 ${token.colorPrimary}33`,
                                }}
                                onClick={() => navigate("/register")}
                                className="hover:-translate-y-[2px]"
                            >
                                Sign up
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {/* Main content */}
            <main className="flex flex-col items-center text-center mt-12 sm:mt-16 space-y-6 px-4">
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                    style={{
                        color: token.colorPrimary,
                        letterSpacing: "0.5px",
                    }}
                >
                    Intelligent Learning Platform
                </h1>

                <p
                    className="text-sm sm:text-base max-w-lg sm:max-w-2xl"
                    style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                    }}
                >
                    Take notes, create AI-generated quizzes, and track your learning progress effectively.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                    <Button
                        type="primary"
                        size="large"
                        style={{
                            backgroundColor: token.colorPrimary,
                            border: "none",
                            fontFamily: "'IBM Plex Mono', monospace",
                            boxShadow: `3px 3px 0 ${token.colorPrimary}55`,
                        }}
                        onClick={() => navigate("/register")}
                    >
                        Get Started for Free →
                    </Button>

                    <Button
                        size="large"
                        style={{
                            border: `1.5px solid ${token.colorPrimary}`,
                            fontFamily: "'IBM Plex Mono', monospace",
                            boxShadow: `3px 3px 0 ${token.colorPrimary}55`,
                        }}
                        onClick={() => navigate("/login")}
                    >
                        Sign in to Your Account
                    </Button>
                </div>
            </main>

            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-5xl w-full px-4 mb-10">
                {[
                    {
                        icon: <BookOutlined />,
                        title: "Smart Notes",
                        desc: "Organize your notes by folders, add tags, and manage knowledge efficiently.",
                    },
                    {
                        icon: <RobotOutlined />,
                        title: "AI-Powered Quizzes",
                        desc: "Automatically generate quizzes from your notes to review and test your understanding.",
                    },
                    {
                        icon: <BarChartOutlined />,
                        title: "Progress Analytics",
                        desc: "Track your learning progress, view performance charts, and improve your results.",
                    },
                ].map((feature, idx) => (
                    <Card
                        key={idx}
                        className="p-4 sm:p-6 text-center"
                        style={cardStyle}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-10 mb-3 mx-auto"
                            style={{
                                backgroundColor: `${token.colorPrimary}11`,
                                color: token.colorPrimary,
                                boxShadow: `2px 2px 0 ${token.colorPrimary}33`,
                            }}
                        >
                            {feature.icon}
                        </div>
                        <h3
                            className="text-base sm:text-lg font-semibold mb-2"
                            style={{ color: token.colorPrimary }}
                        >
                            {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm">{feature.desc}</p>
                    </Card>
                ))}
            </section>

            <Divider
                style={{
                    borderTop: `2px dashed ${token.colorPrimary}55`,
                }}
            />

            {/* PROBLEM SECTION */}
            <section className="max-w-4xl w-full mt-10 px-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: token.colorPrimary }}>
                    <ExclamationCircleOutlined /> Are you struggling?
                </h2>

                <p className="text-sm sm:text-base leading-relaxed">
                    Studying theory for long hours can be exhausting. You read books, watch lectures, and take notes —
                    but still end up wondering:
                    <i> "Do I really understand this material?"</i>
                </p>

                <ul className="mt-4 space-y-2 text-sm sm:text-base">
                    <li>• Not sure which parts you should review</li>
                    <li>• Creating practice questions takes too much time</li>
                    <li>• Hard to track your actual progress and improvement</li>
                </ul>
            </section>

            {/* SOLUTION SECTION */}
            <section className="max-w-4xl w-full mt-16 px-6 mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: token.colorPrimary }}>
                    <CheckCircleOutlined /> Our Solution
                </h2>

                <p className="text-sm sm:text-base leading-relaxed">
                    StudyNest empowers your learning by transforming your notes into AI-powered quizzes, summaries,
                    and personalized progress insights — instantly.
                </p>

                <ul className="mt-4 space-y-2 text-sm sm:text-base">
                    <li>• Automatically generate quizzes in seconds</li>
                    <li>• Review knowledge faster and more effectively</li>
                    <li>• Track your study progress and optimize your learning journey</li>
                </ul>
            </section>

            <Divider
                style={{
                    borderTop: `2px dashed ${token.colorPrimary}55`,
                }}
            />

            {/* CONTACT SECTION */}
            <section className="mt-10 max-w-4xl w-full px-4 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: token.colorPrimary }}>
                    Contact Us
                </h2>

                <p className="text-sm sm:text-base mb-10">
                    Have questions or feedback? We’d love to hear from you.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card
                        className="p-4 sm:p-6 text-center"
                        style={cardStyle}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-10 mb-3 mx-auto"
                            style={{
                                backgroundColor: `${token.colorPrimary}11`,
                                color: token.colorPrimary,
                                boxShadow: `2px 2px 0 ${token.colorPrimary}33`,
                            }}
                        >
                            <MailOutlined />
                        </div>
                        <h3
                            className="text-base sm:text-lg font-semibold mb-2"
                            style={{ color: token.colorPrimary }}
                        >
                            Email
                        </h3>
                        <p className="text-xs sm:text-sm">support@studynest.com</p>
                    </Card>
                    <Card
                        className="p-4 sm:p-6 text-center"
                        style={cardStyle}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-10 mb-3 mx-auto"
                            style={{
                                backgroundColor: `${token.colorPrimary}11`,
                                color: token.colorPrimary,
                                boxShadow: `2px 2px 0 ${token.colorPrimary}33`,
                            }}
                        >
                            <PhoneOutlined />
                        </div>
                        <h3
                            className="text-base sm:text-lg font-semibold mb-2"
                            style={{ color: token.colorPrimary }}
                        >
                            Phone
                        </h3>
                        <p className="text-xs sm:text-sm">0123456789</p>
                    </Card>
                </div>
            </section>

            <footer
                className="w-full mt-24 px-6 sm:px-10 py-5"
                style={{
                    borderTop: `1.5px solid ${token.colorPrimary}E0`,
                    backgroundColor: `${token.colorBgLayout}DD`,
                    fontFamily: "'IBM Plex Mono', monospace",
                }}
            >
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">

                    {/* About */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: token.colorPrimary }}>
                            StudyNest
                        </h4>
                        <p className="text-sm leading-relaxed">
                            A smarter way to learn. Take notes, generate quizzes, and track your progress with ease.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: token.colorPrimary }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li className="cursor-pointer hover:underline" onClick={() => navigate("/homepage")}>Home</li>
                            <li className="cursor-pointer hover:underline" onClick={() => navigate("/login")}>Sign In</li>
                            <li className="cursor-pointer hover:underline" onClick={() => navigate("/register")}>Create Account</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: token.colorPrimary }}>
                            Contact
                        </h4>
                        <p className="text-sm ">support@studynest.com</p>
                        <p className="text-sm mt-1">Ho Chi Minh City, Vietnam</p>
                    </div>
                </div>

                {/* Bottom Line */}
                <div className="text-center text-xs mt-10">
                    © {new Date().getFullYear()} StudyNest. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export function LandingPage() {
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
            <HomePage />

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
    );
}
