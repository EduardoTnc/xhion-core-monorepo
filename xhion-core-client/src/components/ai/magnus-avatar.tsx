import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MagnusAvatarProps {
    state?: "idle" | "listening" | "processing" | "speaking"
    className?: string
    size?: "sm" | "md" | "lg"
}

export function MagnusAvatar({ state = "idle", className, size = "md" }: MagnusAvatarProps) {
    const [pulse, setPulse] = useState(false)

    useEffect(() => {
        if (state === "speaking") {
            const interval = setInterval(() => {
                setPulse((prev) => !prev)
            }, 300)
            return () => clearInterval(interval)
        }
        setPulse(false)
    }, [state])

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-24 w-24",
    }

    return (
        <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
            {/* Outer Glow */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full bg-[#FFBF00]/20 blur-xl transition-all duration-700",
                    state === "processing" && "animate-pulse bg-[#00FFFF]/30",
                    state === "speaking" && "bg-[#FFBF00]/40"
                )}
            />

            {/* Hexagon Container */}
            <div className="relative h-full w-full">
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                        "h-full w-full transition-transform duration-700",
                        state === "listening" && "animate-[spin_4s_linear_infinite]",
                        state === "processing" && "animate-[spin_1s_linear_infinite]"
                    )}
                >
                    {/* Hexagon Border */}
                    <path
                        d="M50 5L93.3 30V70L50 95L6.7 70V30L50 5Z"
                        stroke={state === "processing" ? "#00FFFF" : "#FFBF00"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                            "transition-colors duration-500",
                            state === "idle" && "opacity-80"
                        )}
                    />

                    {/* Inner Geometric Elements */}
                    <path
                        d="M50 20L75 35V65L50 80L25 65V35L50 20Z"
                        stroke={state === "processing" ? "#00FFFF" : "#FFBF00"}
                        strokeWidth="1"
                        className="opacity-50"
                    />

                    {/* Core */}
                    <circle
                        cx="50"
                        cy="50"
                        r={state === "speaking" ? (pulse ? 12 : 8) : 6}
                        fill={state === "processing" ? "#00FFFF" : "#FFBF00"}
                        className="transition-all duration-300"
                    />

                    {/* Connecting Lines (The "Network") */}
                    <path
                        d="M50 50L50 5M50 50L93.3 70M50 50L6.7 70"
                        stroke={state === "processing" ? "#00FFFF" : "#FFBF00"}
                        strokeWidth="0.5"
                        className={cn(
                            "opacity-30",
                            state === "processing" && "opacity-60"
                        )}
                    />
                </svg>
            </div>

            {/* Particles (CSS only simulation) */}
            {state === "processing" && (
                <>
                    <div className="absolute top-0 right-0 h-1 w-1 animate-ping rounded-full bg-[#00FFFF]" />
                    <div className="absolute bottom-0 left-0 h-1 w-1 animate-ping rounded-full bg-[#00FFFF] delay-100" />
                </>
            )}
        </div>
    )
}
