import SpinnerFull from "@/components/SpinnerFull/SpinnerFull";
import useAutoValidateToken from "@/hooks/authHook/useAutoValidateToken";
import React from "react";

interface AuthProviderProps {
    children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { isLoading } = useAutoValidateToken();
    if (isLoading) return <div className="min-h-dvh flex justify-center items-center">
        <SpinnerFull />
    </div>
    return <>
        {children}
    </>
};

export default AuthProvider;
