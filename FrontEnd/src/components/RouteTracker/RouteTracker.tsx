import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectUserId } from "@/store/authSlice";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function RouteTracker() {
    const location = useLocation();
    const userId = useReduxSelector(selectUserId);

    useEffect(() => {
        // Save the current route (excluding auth pages)
        if (!location.pathname.includes("login") && !location.pathname.includes("register")) {
            localStorage.setItem("lastRoute", location.pathname);
            localStorage.setItem("userId", userId);
        }
    }, [location.pathname, userId]);

    return null; // This component doesn't render anything
}

export default RouteTracker;