import { ERole } from "@/utils/enums/ERole";
import InnerLayout from "./InnerLayout";
import useAuthRedirect from "@/hooks/authHook/useAuthRedirect";

const UserLayout = () => {
    const canRender = useAuthRedirect(ERole.User);

    if (!canRender) return <div />;

    return <InnerLayout role={ERole.User} />;
};

export default UserLayout;
