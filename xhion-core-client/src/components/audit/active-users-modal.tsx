import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { type ActiveUser } from "@/services/auditService"
import { Badge } from "@/components/ui/badge"

interface ActiveUsersModalProps {
    users: ActiveUser[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ActiveUsersModal({ users, open, onOpenChange }: ActiveUsersModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Usuarios Activos (24h)</DialogTitle>
                    <DialogDescription>
                        Usuarios que han realizado acciones en el sistema en las últimas 24 horas.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {users.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No hay usuarios activos en este periodo.</p>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between space-x-4 rounded-lg border p-3 bg-card/50">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {user.nombreCompleto.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{user.nombreCompleto}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="mb-1">{user.rol}</Badge>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(user.ultimoEvento), "HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
