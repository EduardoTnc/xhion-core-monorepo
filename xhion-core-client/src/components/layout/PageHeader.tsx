import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageHeaderTab {
    id: string
    label: string
    icon?: LucideIcon
    badge?: string | number
}

interface PageHeaderProps {
    /** Main title of the page */
    title: string
    /** Optional subtitle/description */
    subtitle?: string
    /** Optional icon to display with title */
    icon?: LucideIcon
    /** Horizontal tab navigation */
    tabs?: PageHeaderTab[]
    /** Currently active tab id */
    activeTab?: string
    /** Tab change handler */
    onTabChange?: (tabId: string) => void
    /** Actions to display on the right side (buttons, etc) */
    actions?: ReactNode
    /** Additional className for customization */
    className?: string
}

// Shared styles for consistency
const HEADER_STYLES = {
    container: "border-b border-border bg-card/95 backdrop-blur-sm flex-shrink-0",
    innerPadding: "px-4 md:px-6 py-4",
    iconContainer: "flex-shrink-0 p-2 rounded-lg bg-primary/10",
    iconSize: "h-5 w-5 text-primary",
    title: "text-xl font-semibold text-foreground tracking-tight",
    subtitle: "text-sm text-muted-foreground mt-0.5",
}

/**
 * Standardized page header component for consistent design across the platform.
 * 
 * Features:
 * - Professional title with optional icon
 * - Optional subtitle for context
 * - Horizontal tab navigation (optional)
 * - Action buttons area (optional)
 * - Responsive design
 */
export function PageHeader({
    title,
    subtitle,
    icon: Icon,
    tabs,
    activeTab,
    onTabChange,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn(HEADER_STYLES.container, className)}>
            {/* Title Row */}
            <div className={HEADER_STYLES.innerPadding}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <div className={HEADER_STYLES.iconContainer}>
                                <Icon className={HEADER_STYLES.iconSize} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className={HEADER_STYLES.title}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p className={HEADER_STYLES.subtitle}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions area */}
                    {actions && (
                        <div className="flex-shrink-0 flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            {tabs && tabs.length > 0 && (
                <div className="px-4 md:px-6">
                    <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange?.(tab.id)}
                                    className={cn(
                                        "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
                                        "rounded-t-lg border-b-2",
                                        isActive
                                            ? "border-primary text-foreground bg-background"
                                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {TabIcon && (
                                        <TabIcon className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    )}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">
                                        {tab.label.split(' ')[0]}
                                    </span>
                                    {tab.badge !== undefined && (
                                        <span className={cn(
                                            "ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                                            isActive
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            )}
        </div>
    )
}

/**
 * Simpler page header variant without tabs for basic pages.
 * Uses the same styling as PageHeader for consistency.
 */
export function PageHeaderSimple({
    title,
    subtitle,
    icon: Icon,
    actions,
    className,
}: Omit<PageHeaderProps, 'tabs' | 'activeTab' | 'onTabChange'>) {
    return (
        <div className={cn(HEADER_STYLES.container, className)}>
            <div className={HEADER_STYLES.innerPadding}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <div className={HEADER_STYLES.iconContainer}>
                                <Icon className={HEADER_STYLES.iconSize} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className={HEADER_STYLES.title}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p className={HEADER_STYLES.subtitle}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {actions && (
                        <div className="flex-shrink-0 flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

