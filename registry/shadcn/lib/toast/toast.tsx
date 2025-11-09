"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, XCircle, Info, AlertTriangle, Loader2, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all min-h-[64px]",
    {
        variants: {
            variant: {
                default: "border-border bg-background text-foreground",
                success: "border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-100",
                error: "border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100",
                info: "border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100",
                warning: "border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-100",
                loading: "border-border bg-background text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const iconVariants = cva("h-5 w-5 shrink-0", {
    variants: {
        variant: {
            default: "text-foreground",
            success: "text-green-600 dark:text-green-400",
            error: "text-red-600 dark:text-red-400",
            info: "text-blue-600 dark:text-blue-400",
            warning: "text-yellow-600 dark:text-yellow-400",
            loading: "text-muted-foreground animate-spin",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})

const ICON_MAP = {
    default: Bell,
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
    loading: Loader2,
} as const

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
    title?: string
    description?: string
    onClose?: () => void
    icon?: React.ReactNode
    dismissible?: boolean
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, title, description, onClose, icon, dismissible = true, ...props }, ref) => {
        const IconComponent = ICON_MAP[variant || "default"]
        const displayIcon = icon !== undefined ? icon : IconComponent && <IconComponent className={cn(iconVariants({ variant }))} />

        return (
            <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
                <div className="shrink-0 flex items-center justify-center w-5 h-5">
                    {displayIcon}
                </div>

                <div className="flex-1 min-w-0">
                    {title && (
                        <div className="text-sm font-semibold leading-tight tracking-tight truncate">
                            {title}
                        </div>
                    )}
                    {description && (
                        <div className="text-sm opacity-90 leading-snug mt-0.5">
                            {description}
                        </div>
                    )}
                </div>

                {dismissible && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                )}
            </div>
        )
    }
)

Toast.displayName = "Toast"

export { Toast, toastVariants }