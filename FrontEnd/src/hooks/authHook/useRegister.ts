import { useMutation } from "@tanstack/react-query";
import { useReduxDispatch } from "../reduxHook/useReduxDispatch";
import { initAuthState, selectRole } from "@/store/authSlice";
import { useReduxSelector } from "../reduxHook/useReduxSelector";
import { ERole } from "@/utils/enums/ERole";
import { useNavigate } from "react-router-dom";
import { UserRegister } from "@/types/auth/userRegister";
import authService from "@/services/authService";

const useRegister = () => {
    const dispatch = useReduxDispatch();
    const role = useReduxSelector(selectRole);
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: (userRegister: UserRegister) => authService.register(userRegister),
        onSuccess: (data) => {
            if (data.result) {
                dispatch(initAuthState(data.result));
                window.localStorage.setItem('accessToken', data.result);
                console.log(role);
                switch (role) {
                    case ERole.User:
                        navigate("/user/notes");
                        break;
                    case ERole.Admin:
                        navigate("/admin/dashboard");
                        break;
                }
            }
        }
    })
    return {
        registerFn: mutation.mutate,
        isRegistering: mutation.isPending,
        registerError: mutation.error,
    }
}

export default useRegister;