import { useEffect, useState } from "react"

const TOAST_TIMEOUT = 5000

export function useToast() {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const interval = setInterval(() => {
            setToasts((toasts) => toasts.filter((toast) => toast.timestamp + TOAST_TIMEOUT > Date.now()))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    function toast({ title, description, variant = "default" }) {
        setToasts((toasts) => [
            ...toasts,
            {
                id: Math.random().toString(36).substr(2, 9),
                title,
                description,
                variant,
                timestamp: Date.now(),
            },
        ])
    }

    return { toast, toasts }
}