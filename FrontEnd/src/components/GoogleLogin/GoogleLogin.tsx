import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {

    const handleLoginWithGoogle = () => {
        const returnUrl = import.meta.env.VITE_RETURN_URL || 'http://localhost:80/login';
        window.location.href = `http://localhost:5103/api/v1/Auth/Login/Google?returnUrl=${returnUrl}`;
    }

    return (
        <button
            onClick={handleLoginWithGoogle}
            className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all w-full justify-center"
        >
            <FcGoogle size={24} />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>
    );
};

export default GoogleLogin;
