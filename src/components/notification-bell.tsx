"use client"

import * as React from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function NotificationBell() {
    const [notifications, setNotifications] = React.useState<any[]>([])
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [open, setOpen] = React.useState(false)

    // Poll for notifications
    React.useEffect(() => {
        const runUpdates = async () => {
            try {
                const res = await api.get('/notifications/')
                let list: any[] = []
                if (res?.data) {
                    if (Array.isArray(res.data)) list = res.data
                    else if (res.data.results && Array.isArray(res.data.results)) list = res.data.results
                }
                setNotifications(list)
                setUnreadCount(list.filter((n: any) => n && !n.is_read).length)
            } catch (e) {
                // Ignore
            }
        }

        runUpdates()
        const interval = setInterval(runUpdates, 65000)
        return () => clearInterval(interval)
    }, [])

    async function markRead(id: number) {
        try {
            await api.post(`/notifications/${id}/mark_read/`)
            // Optimistic update
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (e) {
            console.error("Failed to mark read")
        }
    }

    async function markAllRead() {
        try {
            await api.post('/notifications/mark_all_read/')
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-auto p-0 text-muted-foreground hover:text-primary">
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    <div className="divide-y">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 opacity-20" />
                                <p className="mt-2 text-sm">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "flex gap-3 p-4 transition-colors hover:bg-muted/50",
                                        !notif.is_read && "bg-muted/20"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-1 h-2 w-2 rounded-full",
                                        !notif.is_read ? "bg-blue-600" : "bg-transparent"
                                    )} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                            {notif.link && (
                                                <Link
                                                    href={notif.link}
                                                    className="text-[10px] text-primary hover:underline"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    View
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notif.is_read && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={() => markRead(notif.id)}
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
