import { proxy } from "valtio"

export type ToastType = "default" | "success" | "error" | "info" | "warning" | "loading"

export type ToastPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"

export type Toast = {
    id: string
    title?: string
    description?: string
    type?: ToastType
    duration?: number
    promise?: boolean
    onAutoClose?: () => void
    dismissible?: boolean
    icon?: React.ReactNode
    position?: ToastPosition
}

export type ToastPromiseData = {
    loading: string | { title: string; description?: string }
    success: string | { title: string; description?: string } | ((data: unknown) => string | { title: string; description?: string })
    error: string | { title: string; description?: string } | ((error: unknown) => string | { title: string; description?: string })
}

const state = proxy({
    toasts: [] as Toast[],
    position: "bottom-right" as ToastPosition,
    maxToasts: 3,
    defaultDuration: 4000,
})

export const MAX_TOASTS = 3
export const DEFAULT_DURATION = 4000
const timeouts = new Map<string, NodeJS.Timeout>()
const remainingTimes = new Map<string, number>()
const startTimes = new Map<string, number>()

let toastCount = 0
const genId = () => (++toastCount % Number.MAX_SAFE_INTEGER).toString()

export const setPosition = (position: ToastPosition) => state.position = position

export const setMaxToasts = (max: number) => state.maxToasts = max

export const setDefaultDuration = (duration: number) => state.defaultDuration = duration

const clearToastTimer = (id: string) => {
    const timeout = timeouts.get(id)
    if (timeout) clearTimeout(timeout)
    timeouts.delete(id)
    remainingTimes.delete(id)
    startTimes.delete(id)
}

export const pauseToast = (id: string) => {
    const timeout = timeouts.get(id)
    const startTime = startTimes.get(id)

    if (!timeout || !startTime) return

    clearTimeout(timeout)
    timeouts.delete(id)

    const elapsed = Date.now() - startTime
    const originalDuration = remainingTimes.get(id) || 0
    remainingTimes.set(id, Math.max(0, originalDuration - elapsed))
}

export const resumeToast = (id: string) => {
    const remaining = remainingTimes.get(id)
    if (!remaining || remaining <= 0) return

    const toast = state.toasts.find(t => t.id === id)
    if (!toast) return

    startTimes.set(id, Date.now())
    const timeout = setTimeout(() => {
        dismissToast(id)
        toast.onAutoClose?.()
    }, remaining)
    timeouts.set(id, timeout)
}

const createToast = (data: Omit<Toast, "id">): string => {
    const id = genId()
    const toast: Toast = {
        id,
        duration: data.type === "loading" ? Infinity : state.defaultDuration,
        type: "default",
        dismissible: true,
        ...data,
    }

    if (state.toasts.length >= state.maxToasts) {
        const oldestId = state.toasts[0].id
        clearToastTimer(oldestId)
        state.toasts = state.toasts.slice(1)
    }

    state.toasts = [...state.toasts, toast]

    if (toast.duration && toast.duration !== Infinity && toast.duration > 0) {
        remainingTimes.set(id, toast.duration)
        startTimes.set(id, Date.now())
        timeouts.set(id, setTimeout(() => {
            dismissToast(id)
            toast.onAutoClose?.()
        }, toast.duration))
    }

    return id
}

const dismissToast = (id: string) => {
    clearToastTimer(id)
    state.toasts = state.toasts.filter(t => t.id !== id)
}

const updateToast = (id: string, data: Partial<Toast>) => {
    state.toasts = state.toasts.map(t => t.id === id ? { ...t, ...data } : t)

    if (data.duration !== undefined && data.duration !== Infinity && data.duration > 0) {
        clearToastTimer(id)
        remainingTimes.set(id, data.duration)
        startTimes.set(id, Date.now())
        timeouts.set(id, setTimeout(() => dismissToast(id), data.duration))
    }
}

export const toast = {
    show: (data: Omit<Toast, "id">) => createToast(data),

    success: (title: string, description?: string) => createToast({ type: "success", title, description }),

    error: (title: string, description?: string) => createToast({ type: "error", title, description }),

    info: (title: string, description?: string) => createToast({ type: "info", title, description }),

    warning: (title: string, description?: string) => createToast({ type: "warning", title, description }),

    loading: (title: string, description?: string) => createToast({ type: "loading", title, description, duration: Infinity }),

    promise: <T,>(promise: Promise<T>, data: ToastPromiseData): Promise<T> => {
        const loadingData = typeof data.loading === "string" ? { title: data.loading } : data.loading
        const id = createToast({ type: "loading", ...loadingData, promise: true, duration: Infinity })

        promise
            .then(response => {
                const successData = typeof data.success === "function" ? data.success(response) : data.success
                const successContent = typeof successData === "string" ? { title: successData } : successData
                updateToast(id, { type: "success", ...successContent, duration: state.defaultDuration })
            })
            .catch(error => {
                const errorData = typeof data.error === "function" ? data.error(error) : data.error
                const errorContent = typeof errorData === "string" ? { title: errorData } : errorData
                updateToast(id, { type: "error", ...errorContent, duration: state.defaultDuration })
            })

        return promise
    },

    dismiss: (id?: string) => id ? dismissToast(id) : (state.toasts = []),

    update: (id: string, data: Partial<Toast>) => updateToast(id, data),
}

export default state