import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronUp, ChevronDown, ThumbsUp, ThumbsDown, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueryHistoryItem } from '@/store/aiSearchStore';

interface AiResponseCardProps {
    item: QueryHistoryItem;
    isActive: boolean;
    onToggle: () => void;
    onFeedback: (useful: boolean) => void;
    onClose?: () => void;
    onRemove?: () => void;
}

export function AiResponseCard({
    item,
    isActive,
    onToggle,
    onFeedback,
    onClose,
    onRemove
}: AiResponseCardProps) {
    const { query, response, timestamp, isExpanded, feedbackGiven } = item;

    return (
        <div
            className={cn(
                "rounded-lg border transition-all",
                isActive
                    ? "border-[#FFBF00] bg-[#FFBF00]/5 shadow-sm"
                    : "border-border hover:border-border/80"
            )}
        >
            {/* Header - Always visible */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer select-none"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Sparkles className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-[#FFBF00]" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {query}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(timestamp, { addSuffix: true, locale: es })}
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Content - Only when expanded */}
            {isExpanded && (
                <div className="border-t border-border">
                    {/* Response */}
                    <div className="p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{response}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between px-4 pb-3 border-t border-border/50 pt-3">
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                    "h-8 w-8 p-0",
                                    feedbackGiven === 'up' && "text-green-500 hover:text-green-600"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFeedback(true);
                                }}
                                disabled={feedbackGiven === 'up'}
                            >
                                <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                    "h-8 w-8 p-0",
                                    feedbackGiven === 'down' && "text-red-500 hover:text-red-600"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFeedback(false);
                                }}
                                disabled={feedbackGiven === 'down'}
                            >
                                <ThumbsDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            {!isActive && onRemove && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 gap-1.5 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove();
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="text-xs">Eliminar</span>
                                </Button>
                            )}

                            {isActive && onClose && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClose();
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" />
                                    <span className="text-xs">Minimizar</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
