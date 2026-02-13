"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, Globe, Bell, Lock } from "lucide-react"

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(false)

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            toast.success("General settings updated successfully!")
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">General Settings</h2>
                <p className="text-muted-foreground">Configure your portal's core behavior and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-primary" />
                            <CardTitle>Regional & Localization</CardTitle>
                        </div>
                        <CardDescription>Set the default language and time zone for your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Default Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English (US)</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Time Zone</Label>
                                <Select defaultValue="utc">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Time Zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                                        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="size-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Control which system alerts you receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive weekly reports and student alerts.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">Real-time alerts in your browser.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="size-5 text-primary" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Manage your authentication preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.info("MFA setup coming soon.")}>Enable</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={loading} className="px-8 bg-primary shadow-lg shadow-primary/20">
                    {loading ? "Saving..." : <><Save className="size-4 mr-2" /> Save Changes</>}
                </Button>
            </div>
        </div>
    )
}
