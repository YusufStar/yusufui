"use client"

import * as React from "react"
import { useSnapshot } from "valtio"
import { AnimatePresence, motion, PanInfo } from "framer-motion"
import state, { toast as toastStore, type Toast as ToastData, type ToastPosition, pauseToast, resumeToast, setPosition, MAX_TOASTS, DEFAULT_DURATION, setMaxToasts, setDefaultDuration } from "../lib/toast/store"
import { Toast } from "./toast"

export interface ToasterProps {
    position?: ToastPosition
    visibleToasts?: number
    offset?: number
    toastWidth?: number
    swipeThreshold?: number
    expandOnHover?: boolean
    hoverEnterDelay?: number
    hoverLeaveDelay?: number
    maxToasts?: number
    defaultDuration?: number
}

const DEFAULT_CONFIG = {
    position: "bottom-right" as ToastPosition,
    visibleToasts: MAX_TOASTS,
    offset: 16,
    toastWidth: 356,
    swipeThreshold: 100,
    expandOnHover: true,
    hoverEnterDelay: 100,
    hoverLeaveDelay: 150,
    maxToasts: MAX_TOASTS,
    defaultDuration: DEFAULT_DURATION,
}

const POSITION_STYLES: Record<ToastPosition, (offset: number, width: number) => React.CSSProperties> = {
    "top-left": (offset, width) => ({ top: offset, left: offset, width }),
    "top-center": (offset, width) => ({ top: offset, left: "50%", width, marginLeft: -(width / 2) }),
    "top-right": (offset, width) => ({ top: offset, right: offset, width }),
    "bottom-left": (offset, width) => ({ bottom: offset, left: offset, width }),
    "bottom-center": (offset, width) => ({ bottom: offset, left: "50%", width, marginLeft: -(width / 2) }),
    "bottom-right": (offset, width) => ({ bottom: offset, right: offset, width }),
}

const ORIGIN_CLASSES: Record<ToastPosition, string> = {
    "top-left": "origin-top-left",
    "top-center": "origin-top",
    "top-right": "origin-top-right",
    "bottom-left": "origin-bottom-left",
    "bottom-center": "origin-bottom",
    "bottom-right": "origin-bottom-right",
}

interface ToastItemProps {
    toast: ToastData
    index: number
    total: number
    onClose: () => void
    position: ToastPosition
    isExpanded: boolean
    visibleToasts: number
    toastWidth: number
    swipeThreshold: number
}

const ToastItem = React.memo(({ toast, index, total, onClose, position, isExpanded, visibleToasts, toastWidth, swipeThreshold }: ToastItemProps) => {
    const isTop = position.startsWith("top")
    const reverseIndex = total - 1 - index
    const isVisible = reverseIndex < visibleToasts

    const EXPANDED_GAP = 10
    const STANDARD_HEIGHT = 64 + EXPANDED_GAP
    const stackOffset = isExpanded ? reverseIndex * (STANDARD_HEIGHT + EXPANDED_GAP) : reverseIndex * 15
    const scale = isExpanded ? 1 : 1 - reverseIndex * 0.04
    const opacity = reverseIndex >= visibleToasts ? 0 : 1
    const blur = isExpanded ? 0 : reverseIndex > 0 ? reverseIndex * 0.5 : 0

    const handleDragEnd = React.useCallback((_: unknown, info: PanInfo) => {
        if (Math.abs(info.offset.x) > swipeThreshold) onClose()
    }, [swipeThreshold, onClose])

    return (
        <motion.div
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: isTop ? -100 : 100, scale: 0.9 }}
            animate={{ opacity, y: isTop ? stackOffset : -stackOffset, scale, filter: `blur(${blur}px)`, zIndex: 1000 - reverseIndex }}
            exit={{ opacity: 0, x: position.includes("right") ? 100 : position.includes("left") ? -100 : 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 0,
                right: position.includes("right") ? 0 : undefined,
                left: position.includes("left") ? 0 : position.includes("center") ? 0 : undefined,
                width: toastWidth,
                pointerEvents: isVisible ? "auto" : "none",
            }}
            className={ORIGIN_CLASSES[position]}
        >
            <Toast
                variant={toast.type}
                title={toast.title}
                description={toast.description}
                onClose={onClose}
                icon={toast.icon as React.ReactNode}
                dismissible={toast.dismissible}
            />
        </motion.div>
    )
})

ToastItem.displayName = "ToastItem"

export function Toaster({
    position: defaultPosition = DEFAULT_CONFIG.position,
    visibleToasts = DEFAULT_CONFIG.visibleToasts,
    offset = DEFAULT_CONFIG.offset,
    toastWidth = DEFAULT_CONFIG.toastWidth,
    swipeThreshold = DEFAULT_CONFIG.swipeThreshold,
    expandOnHover = DEFAULT_CONFIG.expandOnHover,
    hoverEnterDelay = DEFAULT_CONFIG.hoverEnterDelay,
    hoverLeaveDelay = DEFAULT_CONFIG.hoverLeaveDelay,
    maxToasts = DEFAULT_CONFIG.maxToasts,
    defaultDuration = DEFAULT_CONFIG.defaultDuration,
}: ToasterProps = {}) {
    const snap = useSnapshot(state)
    const position = snap.position || defaultPosition
    const [isExpanded, setIsExpanded] = React.useState(false)
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        setPosition(defaultPosition)
        setMaxToasts(maxToasts)
        setDefaultDuration(defaultDuration)
    }, [defaultPosition, maxToasts, defaultDuration])

    const handleMouseEnter = React.useCallback(() => {
        if (!expandOnHover) return

        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current)
            leaveTimeoutRef.current = null
        }

        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

        hoverTimeoutRef.current = setTimeout(() => {
            setIsExpanded(true)
            snap.toasts.forEach(t => pauseToast(t.id))
        }, hoverEnterDelay)
    }, [expandOnHover, hoverEnterDelay, snap.toasts])

    const handleMouseLeave = React.useCallback(() => {
        if (!expandOnHover) return

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }

        leaveTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false)
            snap.toasts.forEach(t => resumeToast(t.id))
        }, hoverLeaveDelay)
    }, [expandOnHover, hoverLeaveDelay, snap.toasts])

    React.useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
        }
    }, [])

    const positionStyles = React.useMemo(() => ({
        ...POSITION_STYLES[position](offset, toastWidth),
        position: "fixed" as const,
        pointerEvents: "none" as const,
        zIndex: 100,
        padding: '10px',
        margin: '-10px',
    }), [position, offset, toastWidth])

    return (
        <div
            className="fixed"
            style={positionStyles}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative" style={{ pointerEvents: "auto" }}>
                <AnimatePresence mode="popLayout">
                    {snap.toasts.map((t, index) => (
                        <ToastItem
                            key={t.id}
                            toast={{
                                id: t.id,
                                title: t.title,
                                description: t.description,
                                type: t.type,
                                duration: t.duration,
                                promise: t.promise,
                                onAutoClose: t.onAutoClose,
                                dismissible: t.dismissible,
                                icon: t.icon as React.ReactNode,
                                position: t.position,
                            }}
                            index={index}
                            total={snap.toasts.length}
                            onClose={() => toastStore.dismiss(t.id)}
                            position={t.position || position}
                            isExpanded={isExpanded}
                            visibleToasts={visibleToasts}
                            toastWidth={toastWidth}
                            swipeThreshold={swipeThreshold}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
