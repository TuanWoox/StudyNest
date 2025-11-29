import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAntDesignTheme } from "@/hooks/common";
import useResetPassword from "@/hooks/authHook/useResetPassword";
import { ResetPasswordDTO } from "@/types/auth/ResetPasswordDTO";
import { toast } from "sonner";

interface FormInputs {
    newPassword: string;
    confirmPassword: string;
}

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const emailParam = query.get("email") ?? "";
    const tokenParam = query.get("token") ?? "";
    const { token, borderColor, shadowColor, bgColor, textColor } = useAntDesignTheme();

    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormInputs>({ mode: "onChange" });

    const {
        resetPasswordAsync,
        isLoading
    } = useResetPassword();


    useEffect(() => {
        if (!emailParam || !tokenParam) {
            toast.error("Invalid reset link. Please request a new password reset.");
        }
    }, [emailParam, tokenParam]);

    const onSubmit = async (formData: FormInputs) => {
        const payload: ResetPasswordDTO = {
            email: emailParam,
            token: decodeURIComponent(tokenParam),
            newPassword: formData.newPassword,
        };

        try {
            const res = await resetPasswordAsync(payload);
            if (res.result) {
                setTimeout(() => navigate("/login"), 2500);
            }
        } catch (ex) {
            console.error(ex);
        }
    };


    return (
        <div className="w-[95%] sm:w-[85%] md:w-[70%] lg:w-[50%] max-w-xl m-5 transition-all duration-300 ease-out">
            <div
                style={{
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: `6px 6px 0 ${shadowColor}`,
                    backgroundColor: bgColor,
                    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                    color: textColor
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
                        Reset Password
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        <div>
                            <label className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Email
                            </label>
                            <input type="text" value={emailParam} readOnly className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono`}
                                style={{
                                    color: textColor,
                                    boxShadow: `4px 4px 0 ${shadowColor}`,
                                    border: `1.5px solid ${borderColor}`,
                                }} />
                        </div>

                        <div>
                            <label className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                New password
                            </label>
                            <input
                                type="password"
                                {...register("newPassword", { required: "Required", minLength: { value: 6, message: "At least 6 characters" } })}
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono`}
                                style={{
                                    color: textColor,
                                    boxShadow: `4px 4px 0 ${shadowColor}`,
                                    border: `1.5px solid ${borderColor}`,
                                }}
                                placeholder="New password"
                                disabled={isLoading}
                            />
                            {errors.newPassword && <p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.newPassword.message?.toString()}</p>}
                        </div>

                        <div>
                            <label className="block text-base sm:text-lg mb-2"
                                style={{
                                    color: textColor,
                                    fontFamily: "'IBM Plex Mono', monospace",
                                }}
                            >
                                Confirm password
                            </label>
                            <input
                                type="password"
                                {...register("confirmPassword", { required: "Required", validate: v => v === watch("newPassword") || "Passwords do not match" })}
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-200 outline-none font-mono`}
                                style={{
                                    color: textColor,
                                    boxShadow: `4px 4px 0 ${shadowColor}`,
                                    border: `1.5px solid ${borderColor}`,
                                }}
                                placeholder="Confirm password"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && <p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message?.toString()}</p>}
                        </div>

                        <button type="submit" disabled={!isValid || isLoading} className="w-full py-3 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[3px] hover:cursor-pointer mt-5"
                            style={{
                                color: token.colorText,
                                boxShadow: `4px 4px 0 ${shadowColor}`,
                                border: `1px solid ${borderColor}`,
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: 600,
                            }}>
                            {isLoading ? "Resetting..." : "Reset password"}
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
                                ← Back to Login
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;