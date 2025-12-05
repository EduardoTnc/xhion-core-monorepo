

interface MarkdownRendererProps {
    content: string
    className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    if (!content) return null

    // Split by newlines to handle paragraphs
    const paragraphs = content.split('\n').filter(Boolean)

    return (
        <div className={`space-y-2 text-sm text-muted-foreground ${className}`}>
            {paragraphs.map((paragraph, index) => {
                // Check for list items
                if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                    const text = paragraph.trim().substring(2)
                    return (
                        <div key={index} className="flex items-start gap-2 ml-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                            <span>{renderInlineStyles(text)}</span>
                        </div>
                    )
                }

                // Check for numbered lists
                if (/^\d+\.\s/.test(paragraph.trim())) {
                    const match = paragraph.trim().match(/^(\d+)\.\s(.*)/)
                    if (match) {
                        return (
                            <div key={index} className="flex items-start gap-2 ml-2">
                                <span className="font-semibold text-primary/80 shrink-0">{match[1]}.</span>
                                <span>{renderInlineStyles(match[2])}</span>
                            </div>
                        )
                    }
                }

                return <p key={index}>{renderInlineStyles(paragraph)}</p>
            })}
        </div>
    )
}

function renderInlineStyles(text: string) {
    // Split by bold markers (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g)

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        }
        // Handle italics (*text*)
        const subParts = part.split(/(\*.*?\*)/g)
        return subParts.map((subPart, j) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
                return <em key={`${i}-${j}`} className="italic text-foreground/90">{subPart.slice(1, -1)}</em>
            }
            return subPart
        })
    })
}
