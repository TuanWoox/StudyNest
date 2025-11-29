import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectActiveLogout, selectRole } from "@/store/authSlice";
import { ERole } from "@/utils/enums/ERole";


const useAuthRedirect = (requiredRole?: ERole) => {
    const role = useReduxSelector(selectRole);
    const activeLogout = useReduxSelector(selectActiveLogout);
    const navigate = useNavigate();

    useEffect(() => {
        if (!role) {
            if (!activeLogout && requiredRole) {
                navigate("/login");
                return;
            }
            return;
        }

        if (requiredRole && role !== requiredRole) {
            // Redirect to the correct layout based on role
            switch (role) {
                case ERole.Admin:
                    navigate("/admin");
                    break;
                case ERole.User:
                    navigate("/user");
                    break;
                default:
                    navigate("/homepage");
            }
        }

        if (!requiredRole) {
            if (role === ERole.User) {
                navigate('/user');
            } else if (role === ERole.Admin) {
                navigate('/admin');
            }
        }

    }, [role, activeLogout, requiredRole, navigate]);

    // Return a flag to know if we should render the component
    return role && (!requiredRole || role === requiredRole);
};

export default useAuthRedirect;
