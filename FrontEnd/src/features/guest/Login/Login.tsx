import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Spinner from "@/components/Spinner/Spinner";
import GoogleLogin from "@/components/GoogleLogin/GoogleLogin";
import useLogin from "@/hooks/authHook/useLogin";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { useAntDesignTheme } from "@/hooks/common";
import { initAuthState, selectRole } from "@/store/authSlice";
import { selectDarkMode } from "@/store/themeSlice";
import useAuthRedirect from "@/hooks/authHook/useAuthRedirect";

interface LoginFormInputs {
    username: string;
    password: string;
    rememberMe: boolean;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useReduxDispatch();

    const { token, borderColor, shadowColor, bgColor, textColor } =
        useAntDesignTheme();
    const darkMode = useReduxSelector(selectDarkMode);
    const { login, isAuthenticating } = useLogin();
    const role = useReduxSelector(selectRole);
    useAuthRedirect();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormInputs>({
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
        },
    });

    // Handle OAuth callback with token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            window.localStorage.setItem("accessToken", token);
            dispatch(initAuthState(token));
        }
    }, [dispatch]);


    const onSubmit = (data: LoginFormInputs) => {
        login({
            userNameOrEmail: data.username,
            password: data.password,
            rememberMe: data.rememberMe,
        });
    };

    if (role) return null;
    return (
        <div className="w-[95%] sm:w-[85%] md:w-[70%] lg:w-[50%] max-w-xl m-5 transition-all duration-300 ease-out">
            <div
                style={{
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: `6px 6px 0 ${shadowColor}`,
                    backgroundColor: bgColor,
                    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                }}
            >
                <div className="flex flex-col items-center px-4 sm:px-6 md:px-8 lg:px-10 py-8 gap-y-5">
                    {/* Title */}
                    <div
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center"
                        style={{
                            color: token.colorPrimary,
                            textShadow: `2px 2px 0 ${shadowColor}`,
                            letterSpacing: "1px",
                        }}
                    >
                        Study Nest
                    </div>

                    {/* Subtitle */}
                    <h2
                        className="text-lg sm:text-xl md:text-2xl font-medium text-center mb-1"
                        style={{
                            color: textColor,
                            fontFamily: "'IBM Plex Mono', monospace",
                        }}
                    >
                        Sign in to your account
                    </h2>

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full space-y-5"
                    >
                        {/* Username Field */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Username or Email
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register("username", {
                                    required: "Username or email is required",
                                    minLength: {
                                        value: 3,
                                        message: "Must be at least 3 characters",
                                    },
                                })}
                                placeholder="Enter your username or email"
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono ${errors.username
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border border-gray-300 focus:border-gray-900"
                                    }`}
                                style={{
                                    backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                                    color: textColor,
                                    boxShadow: `4px 4px 0 ${shadowColor}`,
                                    border: `1.5px solid ${borderColor}`,
                                }}
                            />
                            {errors.username && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-600">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                                placeholder="Enter your password"
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono ${errors.password
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border border-gray-300 focus:border-gray-900"
                                    }`}
                                style={{
                                    backgroundColor: darkMode ? "#1e1e1e" : "#fafafa",
                                    color: textColor,
                                    boxShadow: `4px 4px 0 ${shadowColor}`,
                                    border: `1.5px solid ${borderColor}`,
                                }}
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-xs sm:text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center pt-1">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                {...register("rememberMe")}
                                className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                            <label
                                htmlFor="rememberMe"
                                className="ml-2 text-sm sm:text-base"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isValid || isAuthenticating}
                            className="w-full py-3 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[3px] hover:cursor-pointer mt-6"
                            style={{
                                color: token.colorText,
                                boxShadow: `4px 4px 0 ${shadowColor}`,
                                border: `1px solid ${borderColor}`,
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: 600,
                            }}
                        >
                            {isAuthenticating ? <Spinner /> : "Login"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3 my-1">
                        <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: borderColor }}
                        />
                        <span
                            className="text-sm"
                            style={{
                                color: textColor,
                                fontFamily: "'IBM Plex Mono', monospace",
                            }}
                        >
                            OR
                        </span>
                        <div
                            className="flex-1 h-px"
                            style={{ backgroundColor: borderColor }}
                        />
                    </div>

                    {/* Google Login */}
                    <div className="w-full">
                        <GoogleLogin disable={isAuthenticating} />
                    </div>

                    {/* Footer Links */}
                    <div
                        className="flex justify-between w-full text-sm sm:text-base mt-4"
                        style={{
                            color: textColor,
                            fontFamily: "'IBM Plex Mono', monospace",
                        }}
                    >
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>
                        <span
                            className="cursor-pointer hover:underline"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </span>
                    </div>

                    {/* Back to Home Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/homepage")}
                        className="self-start mt-3 px-3 py-1.5 border text-sm sm:text-base hover:-translate-y-[2px] transition-all"
                        style={{
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            boxShadow: `3px 3px 0 ${shadowColor}`,
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;