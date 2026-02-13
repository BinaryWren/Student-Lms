"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Bell, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [prefs, setPrefs] = useState<any>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [notifRes, prefRes] = await Promise.all([
                api.get('/notifications/'),
                api.get('/notifications/preferences/')
            ])
            setNotifications(notifRes.data)
            setPrefs(prefRes.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function updatePref(key: string, value: boolean) {
        // Optimistic update
        setPrefs({ ...prefs, [key]: value })
        try {
            await api.patch('/notifications/preferences/', { [key]: value })
        } catch (e) {
            console.error("Failed to update pref")
            // Revert on failure would go here
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your alerts and preferences.
                </p>
            </div>
            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Inbox</TabsTrigger>
                    <TabsTrigger value="settings">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notifications</CardTitle>
                            <CardDescription>You have {notifications.filter(n => !n.is_read).length} unread messages.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {notifications.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No notifications found.</p>
                            ) : (
                                <div className="divide-y relative">
                                    {notifications.map((n) => (
                                        <div key={n.id} className={cn("py-4 flex gap-4", !n.is_read ? "opacity-100" : "opacity-70")}>
                                            <div className={cn("mt-1 h-2 w-2 rounded-full flex-shrink-0", !n.is_read ? "bg-blue-600" : "bg-transparent")} />
                                            <div>
                                                <p className="font-medium text-sm">{n.title}</p>
                                                <p className="text-sm text-muted-foreground">{n.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Channels</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email_enabled" className="flex flex-col space-y-1">
                                    <span>Email Notifications</span>
                                    <span className="font-normal text-xs text-muted-foreground">Receive updates via email.</span>
                                </Label>
                                <Switch id="email_enabled" checked={prefs?.email_enabled} onCheckedChange={(c) => updatePref('email_enabled', c)} />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="in_app_enabled" className="flex flex-col space-y-1">
                                    <span>In-App Notifications</span>
                                    <span className="font-normal text-xs text-muted-foreground">Show alerts within the dashboard.</span>
                                </Label>
                                <Switch id="in_app_enabled" checked={prefs?.in_app_enabled} onCheckedChange={(c) => updatePref('in_app_enabled', c)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Types</CardTitle>
                            <CardDescription>Customize what you want to hear about.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="assignment_reminders">Assignment Deadlines</Label>
                                <Switch id="assignment_reminders" checked={prefs?.assignment_reminders} onCheckedChange={(c) => updatePref('assignment_reminders', c)} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="quiz_reminders">Quiz Reminders</Label>
                                <Switch id="quiz_reminders" checked={prefs?.quiz_reminders} onCheckedChange={(c) => updatePref('quiz_reminders', c)} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="cert_availability">Certificate Readiness</Label>
                                <Switch id="cert_availability" checked={prefs?.cert_availability} onCheckedChange={(c) => updatePref('cert_availability', c)} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="inactivity_warnings">Inactivity Tips</Label>
                                <Switch id="inactivity_warnings" checked={prefs?.inactivity_warnings} onCheckedChange={(c) => updatePref('inactivity_warnings', c)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
