import instance from "@/config/axiosConfig";
import { ResetPasswordDTO } from "@/types/auth/ResetPasswordDTO";
import { UserChangePassword, UserSetPassword } from "@/types/auth/userChangePassword";
import { UserLogin } from "@/types/auth/UserLogin";
import { UserRegister } from "@/types/auth/userRegister";
import { ReturnResult } from "@/types/common/return-result";

const authService = {
    login: async (userLogin: UserLogin) => {
        const { data } = await instance.post<ReturnResult<string>>('/Auth/Login', userLogin)
        return data;
    },
    register: async (userRegister: UserRegister) => {
        const { data } = await instance.post<ReturnResult<string>>('/Auth/Register', userRegister)
        return data;
    },
    validateToken: async () => {
        const { data } = await instance.get<ReturnResult<boolean>>('/Auth/ValidateToken');
        return data;
    },
    changePassword: async (userChangePassword: UserChangePassword) => {
        const { data } = await instance.post<ReturnResult<boolean>>('/Auth/ChangePassword', userChangePassword);
        return data;
    },
    hasPassword: async () => {
        const { data } = await instance.get<ReturnResult<boolean>>('/Auth/HasPassword');
        return data;
    },
    setPassword: async (userSetPassword: UserSetPassword) => {
        const { data } = await instance.post<ReturnResult<boolean>>('/Auth/SetPassword', userSetPassword);
        return data;
    },
    requestPasswordReset: async (email: string) => {
        const payload = { email };
        const { data } = await instance.post<ReturnResult<boolean>>('/Auth/RequestPasswordReset', payload);
        return data;
    },
    resetPassword: async (payload: ResetPasswordDTO) => {
        const { data } = await instance.post<ReturnResult<boolean>>('/Auth/ResetPassword', payload);
        return data;
    },
}

export default authService;