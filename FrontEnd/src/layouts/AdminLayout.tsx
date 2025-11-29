import { ERole } from "@/utils/enums/ERole";
import InnerLayout from "./InnerLayout";
import useAuthRedirect from "@/hooks/authHook/useAuthRedirect";

const AdminLayout = () => {
    const canRender = useAuthRedirect(ERole.Admin);

    if (!canRender) return <div />;

    return <InnerLayout role={ERole.Admin} />;
};

export default AdminLayout;
