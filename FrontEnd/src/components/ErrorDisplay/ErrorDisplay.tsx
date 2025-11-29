import { Button } from "antd"
import { AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface ErrorDisplayProps {
    message?: string | string[]
    title?: string
    variant?: "default" | "inline" | "compact"
    icon?: boolean
}

function ErrorDisplay({
    message,
    title = "Error",
    variant = "default",
    icon = true,
}: ErrorDisplayProps) {
    const navigate = useNavigate();
    const messages = Array.isArray(message)
        ? message.filter(Boolean)
        : message
            ? [message]
            : []

    if (messages.length === 0) return null

    const baseStyles = "border border-destructive bg-destructive/5 "
    const containerStyles = {
        default: `${baseStyles} p-4 shadow-sm`,
        inline: `${baseStyles} p-3 text-sm`,
        compact: `${baseStyles} p-2`,
    }

    const titleStyles = {
        default: "font-semibold text-destructive text-xl",
        inline: "font-semibold text-destructive text-base",
        compact: "font-medium text-destructive text-sm",
    }

    const messageStyles = {
        default: "text-destructive/80 text-base mt-2",
        inline: "text-destructive/75 text-base",
        compact: "text-destructive/70 text-sm",
    }

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <section className="w-full lg:max-w-5xl mx-auto mt-16 p-4" role="alert" aria-live="polite">
            <article className={containerStyles[variant]}>
                <div className="flex gap-3 items-start">
                    {icon && (
                        <AlertCircle
                            className="h-5 w-5 text-destructive flex-shrink-0"
                            aria-hidden="true"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        {title && (
                            <h2 className={titleStyles[variant]}>
                                {title}
                            </h2>
                        )}

                        {messages.length === 1 ? (
                            <p className={messageStyles[variant]}>
                                {messages[0]}
                            </p>
                        ) : (
                            <ul className={`${messageStyles[variant]} list-disc list-inside space-y-1 ${title ? 'mt-2' : ''}`}>
                                {messages.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>


                <div className="mt-4 flex justify-end">
                    <Button
                        type="primary"
                        danger
                        onClick={handleBack}
                    >
                        Back To Previous Page
                    </Button>
                </div>

            </article>
        </section>
    )
}

export default ErrorDisplay;