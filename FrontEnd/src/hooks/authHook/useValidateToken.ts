import authService from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

const useValidateToken = (options?: { enabled?: boolean }) => {
    const enabled = options?.enabled ?? true;

    return useQuery({
        queryKey: ["validateToken"],
        enabled: enabled,
        queryFn: () => authService.validateToken(),
    })
}

export default useValidateToken;