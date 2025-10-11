import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import Spinner from '@/components/Spinner/Spinner';
import useLogin from '@/hooks/authHook/useLogin';
import { useReduxSelector } from '@/hooks/reduxHook/useReduxSelector';
import { initAuthState, selectRole } from '@/store/authSlice';
import { ERole } from '@/utils/enums/ERole';
import GoogleLogin from '@/components/GoogleLogin/GoogleLogin';
import { useReduxDispatch } from '@/hooks/reduxHook/useReduxDispatch';

interface LoginFormInputs {
    username: string;
    password: string;
    rememberMe: boolean;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticating } = useLogin();
    const role = useReduxSelector(selectRole);
    const dispatch = useReduxDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<LoginFormInputs>({
        mode: 'onChange',
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false
        }
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) {
            params.delete("token");
            return;
        }

        window.localStorage.setItem("accessToken", token);
        dispatch(initAuthState(token));

        switch (role) {
            case ERole.User:
                navigate("/user/notes");
                break;
            case ERole.Admin:
                navigate("/admin/dashboard");
                break;
            default:
                break;
        }
    }, []);

    // Handle role-based redirects
    switch (role) {
        case ERole.User:
            return <Navigate to="/user/notes" replace />
        case ERole.Admin:
            return <Navigate to="/admin/dashboard" replace />
    }

    const onSubmit = (data: LoginFormInputs) => {
        login({
            userNameOrEmail: data.username,
            password: data.password,
            rememberMe: data.rememberMe
        });
    };

    return (
        <div className="w-full max-w-xl rounded-lg bg-white p-12 shadow-xl border border-gray-200">
            <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-gray-900 text-center mb-10">
                    Study Nest
                </div>

                <h2 className="text-2xl font-medium text-gray-600 text-center mb-10">
                    Sign in to your account
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-7">
                    {/* Username or Email */}
                    <div>
                        <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            id="username"
                            {...register('username', {
                                required: 'Username or email is required',
                                minLength: {
                                    value: 3,
                                    message: 'Must be at least 3 characters'
                                }
                            })}
                            placeholder="Enter your username or email"
                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 transition ${errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                            placeholder="Enter your password"
                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 transition ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            {...register('rememberMe')}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid || isAuthenticating}
                        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isAuthenticating ? (
                            <>
                                <Spinner />
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>

                </form>

                <div className="my-7 w-full">
                    <GoogleLogin />
                </div>

                {/* Links */}
                <div className="flex justify-between w-full text-sm text-gray-600">
                    <span
                        className="cursor-pointer hover:text-gray-900 transition"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot Password?
                    </span>
                    <span
                        className="cursor-pointer hover:text-gray-900 transition"
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;