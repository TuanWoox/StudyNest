import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Spinner from "@/components/Spinner/Spinner";
import useRegister from "@/hooks/authHook/useRegister";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectDarkMode } from "@/store/themeSlice";
import { useAntDesignTheme } from "@/hooks/common";
import useAuthRedirect from "@/hooks/authHook/useAuthRedirect";
import { selectRole } from "@/store/authSlice";

interface RegisterFormInputs {
    email: string;
    username: string;
    fullName: string;
    password: string;
    confirmPassword: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { token, borderColor, shadowColor, bgColor, textColor } = useAntDesignTheme();
    const { registerFn, isRegistering } = useRegister();
    const darkMode = useReduxSelector(selectDarkMode);
    const role = useReduxSelector(selectRole);
    useAuthRedirect();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<RegisterFormInputs>({
        mode: "onChange",
        defaultValues: {
            email: "",
            username: "",
            fullName: "",
            password: "",
            confirmPassword: "",
        },
    });


    const onSubmit = (data: RegisterFormInputs) => {
        if (data.password !== data.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        registerFn({
            userName: data.username,
            fullName: data.fullName,
            password: data.password,
            email: data.email,
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
                <div className="flex flex-col items-center px-4 sm:px-6 py-6 gap-y-3">
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
                        Create your account
                    </h2>

                    {/* Registration Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full space-y-4"
                    >
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                placeholder="Enter your email"
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono ${errors.email
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
                            {errors.email && (
                                <p className="mt-1 text-xs sm:text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

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
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Must be at least 3 characters",
                                    },
                                })}
                                placeholder="Enter your username"
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
                                <p className="mt-1 text-xs sm:text-sm text-red-600">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Full Name Field */}
                        <div>
                            <label
                                htmlFor="fullName"
                                className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                {...register("fullName", {
                                    required: "Full name is required",
                                })}
                                placeholder="Enter your full name"
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono ${errors.fullName
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
                            {errors.fullName && (
                                <p className="mt-1 text-xs sm:text-sm text-red-600">
                                    {errors.fullName.message}
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
                                    pattern: {
                                        value:
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/,
                                        message:
                                            "Password must be at least 6 chars and include uppercase, lowercase, number, and symbol",
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
                                <p className="mt-1 text-xs sm:text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Repeat Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === watch("password") || "Passwords do not match",
                                })}
                                placeholder="Repeat your password"
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono ${errors.confirmPassword
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
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs sm:text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!isValid || isRegistering}
                            className="w-full py-3 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[3px] hover:cursor-pointer mt-5"
                            style={{
                                color: token.colorText,
                                boxShadow: `4px 4px 0 ${shadowColor}`,
                                border: `1px solid ${borderColor}`,
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: 600,
                            }}
                        >
                            {isRegistering ? <Spinner /> : "Register"}
                        </button>

                        {/* Login Link */}
                        <div
                            className="flex justify-center text-sm sm:text-base pt-1"
                            style={{
                                color: textColor,
                                fontFamily: "'IBM Plex Mono', monospace",
                            }}
                        >
                            <span
                                className="cursor-pointer hover:underline"
                                onClick={() => navigate("/login")}
                            >
                                Already have an account? Login
                            </span>
                        </div>
                    </form>

                    {/* Back to Home Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/homepage")}
                        className="self-start mt-2 px-3 py-1.5 border text-sm sm:text-base hover:-translate-y-[2px] transition-all"
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

export default Register;