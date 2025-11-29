import authService from "@/services/authService"
import { ReturnResult } from "@/types/common/return-result"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

const useHasPassword = () => {
    return useQuery<ReturnResult<boolean>, AxiosError>({
        queryKey: ["hasPassword"],
        queryFn: () => authService.hasPassword()
    })
}

export default useHasPassword;