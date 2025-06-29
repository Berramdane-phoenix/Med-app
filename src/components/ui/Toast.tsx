import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
    }

    const Toast = ({ message, type = "success", onClose }: ToastProps) => {
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setClosing(true), 3000);
        const remove = setTimeout(onClose, 3500);
        return () => {
        clearTimeout(timeout);
        clearTimeout(remove);
        };
    }, [onClose]);

    return (
        <div
        className={`
            fixed top-5 right-5 px-4 py-3 rounded shadow-lg text-white z-50
            ${type === "success" ? "bg-green-600" : "bg-red-600"}
            ${closing ? "animate-fade-out animate-slide-out-right" : "animate-fade-in animate-slide-in-right"}
        `}
        >
        {message}
        </div>
    );
};

export default Toast;
