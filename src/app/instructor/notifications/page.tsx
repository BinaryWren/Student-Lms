"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, UserPlus, MessageSquare, AlertCircle } from "lucide-react"

const notifications = [
    {
        id: 1,
        title: "New Student Enrolled",
        description: "John Doe has joined 'Full Stack Development'.",
        time: "10 minutes ago",
        icon: UserPlus,
        color: "text-blue-500"
    },
    {
        id: 2,
        title: "New Forum Post",
        description: "A student asked a question in the 'Assignment 1' discussion.",
        time: "1 hour ago",
        icon: MessageSquare,
        color: "text-green-500"
    },
    {
        id: 3,
        title: "System Maintenance",
        description: "Scheduled maintenance tonight at 12:00 PM UTC.",
        time: "3 hours ago",
        icon: AlertCircle,
        color: "text-red-500"
    }
]

export default function InstructorNotificationsPage() {
    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Instructor Notifications</h1>
                    <p className="text-muted-foreground">Monitor your course activity and system updates.</p>
                </div>
                <Bell className="size-8 text-muted-foreground/50" />
            </div>

            <div className="space-y-4">
                {notifications.map((n) => (
                    <Card key={n.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <div className={`mt-1 ${n.color}`}>
                                <n.icon className="size-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">{n.title}</CardTitle>
                                    <span className="text-xs text-muted-foreground">{n.time}</span>
                                </div>
                                <CardDescription className="mt-1">{n.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
