import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface AvailableWidget {
  id: string
  label: string
  icon: LucideIcon
}

interface DepartmentWidgetCardProps {
  title: string
  icon: LucideIcon
  iconColor?: string
  summary: ReactNode
  quickActions?: ReactNode
  fullContent: ReactNode
  className?: string
  isExpanded?: boolean
  isOtherExpanded?: boolean
  onToggleExpand?: () => void
  onChangeWidget?: (widgetId: string) => void
  availableWidgets?: AvailableWidget[]
}

export function DepartmentWidgetCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  summary,
  quickActions,
  fullContent,
  className,
  isExpanded = false,
  isOtherExpanded = false,
  onToggleExpand,
  onChangeWidget,
  availableWidgets = [],
}: DepartmentWidgetCardProps) {

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isExpanded ? [
          "col-span-full row-span-full",
          "border-2 border-primary z-50",
          "md:col-span-2 lg:col-span-3"
        ] : isOtherExpanded ? [
          "hidden"
        ] : [
          "cursor-pointer border-border",
          "hover:border-primary/30 hover:bg-muted/30"
        ],
        className
      )}
      onClick={() => !isExpanded && !isOtherExpanded && onToggleExpand?.()}
    >
      <CardHeader className={cn(
        isExpanded ? "pb-3 bg-muted/50" : "pb-3"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center rounded-md border bg-background",
              isExpanded ? "h-11 w-11" : "h-10 w-10"
            )}>
              <Icon className={cn(
                isExpanded ? "h-5 w-5" : "h-4 w-4",
                iconColor
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "font-semibold",
                isExpanded ? "text-lg" : "text-base"
              )}>
                {title}
              </CardTitle>
              {isExpanded && (
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">
                  Vista detallada
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand?.()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Pestañas de navegación rápida */}
        {isExpanded && availableWidgets.length > 0 && (
          <>
            <Separator className="mt-3" />
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Otras secciones</p>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {availableWidgets.map((widget) => {
                    const WidgetIcon = widget.icon
                    return (
                      <Button
                        key={widget.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5 whitespace-nowrap text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onChangeWidget?.(widget.id)
                        }}
                      >
                        <WidgetIcon className="h-3 w-3" />
                        {widget.label}
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className={cn(
        isExpanded ? "p-0" : "space-y-3"
      )}>
        {!isExpanded ? (
          <>
            {/* Summary Info */}
            <div className="text-sm text-muted-foreground">
              {summary}
            </div>

            {/* Quick Actions */}
            {quickActions && (
              <div 
                className="flex flex-wrap gap-2 pt-2 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                {quickActions}
              </div>
            )}
          </>
        ) : (
          /* Expanded Content */
          <div>
            <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
              <div className="p-6">
                {fullContent}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
