import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { resetAuthState, selectRole } from "@/store/authSlice";
import { ERole } from "@/utils/enums/ERole";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EntryComponent = () => {
    const role = useReduxSelector(selectRole);
    const dispatch = useReduxDispatch();
    const navigate = useNavigate();
    // Handle role-based navigation
    useEffect(() => {
        switch (role) {
            case ERole.Admin:
                navigate('/admin', { replace: true });
                break;
            case ERole.User:
                navigate('/user', { replace: true });
                break;
            default:
                dispatch(resetAuthState());
                navigate('/homepage', { replace: true });
                break;
        }
    }, [role, dispatch, navigate]);
    return null;
};

export default EntryComponent;
