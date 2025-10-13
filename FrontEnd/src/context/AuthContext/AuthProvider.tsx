import instance from "@/config/axiosConfig";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { initAuthState, resetAuthState } from "@/store/authSlice";
import { ReturnResult } from "@/types/common/return-result";
import { ReactNode, useEffect, useState } from "react";
import Spinner from "@/components/Spinner/Spinner";


interface ProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: ProviderProps) => {
    const dispatch = useReduxDispatch();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            setIsAuthenticating(true);
            const accessToken = window.localStorage.getItem("accessToken") ?? "";
            try {
                const { data } = await instance.get<ReturnResult<boolean>>("/Auth");
                if (data.result) {
                    dispatch(initAuthState(accessToken))
                } else dispatch(resetAuthState());
            } catch (error) {
                console.log(error);
                dispatch(resetAuthState());
            }
            setIsAuthenticating(false);
        }

        checkAuth();
    }, [dispatch]);

    if (isAuthenticating) return <Spinner />;

    return <>{children}</>;
};
