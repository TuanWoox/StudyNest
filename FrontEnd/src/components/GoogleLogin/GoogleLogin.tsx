import { FcGoogle } from "react-icons/fc";
import { theme } from "antd";


interface GoogleLoginProps {
    disable?: boolean; // optional prop
}

const GoogleLogin = ({ disable }: GoogleLoginProps) => {
    const { token } = theme.useToken();

    const handleLoginWithGoogle = () => {
        const googleAuth = import.meta.env.VITE_API_GOOGLE_AUTH_API;
        window.location.href = `${googleAuth}`;
    }

    const borderColor = `${token.colorPrimary}E0`; // 88% opacity
    const shadowColor = `${token.colorPrimary}55`; // 33% opacity

    return (
        <button
            onClick={handleLoginWithGoogle}
            className="flex items-center gap-3 px-6 py-3 hover:-translate-y-[3px] transition-all w-full justify-center"
            disabled={disable}
            style={{
                color: token.colorText,
                boxShadow: `4px 4px 0 ${shadowColor}`,
                border: `1px solid ${borderColor}`,
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: "pointer",
                fontWeight: 600
            }}
        >
            <FcGoogle size={24} />
            {/* <span className="font-medium"
                style={{ color: token.colorText }}> */}
            Sign in with Google
            {/* </span> */}
        </button>
    );
};


export default GoogleLogin;
