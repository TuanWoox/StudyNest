import useValidateToken from "./useValidateToken";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { initAuthState } from "@/store/authSlice";
import { useDispatch } from "react-redux";

interface DecodedToken {
    nameid: string;
    role: string;
    exp?: number;
    iat?: number;
}

const useAutoValidateToken = () => {
    const { data: validatingResult, refetch } = useValidateToken({ enabled: false });
    const [isLoading, setIsLoading] = useState<boolean>(() => {
        const accessToken = localStorage.getItem("accessToken");
        return !!accessToken;
    });
    const dispatch = useDispatch();

    // 1. Check token presence and structure
    useEffect(() => {
        const checkTokenAccess = async () => {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            let role: string | undefined;
            try {
                ({ role } = jwtDecode<DecodedToken>(accessToken));
            } catch (error) {
                setIsLoading(false);
                console.log(error);
                return;
            }

            // Token exists but no role → invalid token
            if (!role) {
                setIsLoading(false);
                return;
            }

            // Validate token with backend
            await refetch();
        };

        checkTokenAccess();
    }, [refetch]);

    // 2. After validation result comes
    useEffect(() => {
        const handleValidationResult = () => {
            if (validatingResult === undefined) return; // still loading

            // Validation failed
            if (!validatingResult.result) {
                setIsLoading(false);
                return;
            }

            // Token is valid → restore auth state
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                dispatch(initAuthState(accessToken));
            }

            setIsLoading(false);
        };

        handleValidationResult();
    }, [validatingResult, dispatch]);

    return { validatingResult, isLoading };
};

export default useAutoValidateToken;
