"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import { Loader2 } from "lucide-react"

export default function GeneralSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        name: "",
        contact_email: "",
        website_url: "",
        theme_primary_color: ""
    });

    useEffect(() => {
        if (user?.institute) {
            fetchSettings();
        }
    }, [user?.institute]);

    const fetchSettings = async () => {
        try {
            const res = await api.get(`/institutes/${user?.institute}/`);
            setSettings({
                name: res.data.name || "",
                contact_email: res.data.contact_email || "",
                website_url: res.data.website_url || "",
                theme_primary_color: res.data.theme_primary_color || ""
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!user?.institute) return;
        setSaving(true);
        try {
            await api.patch(`/institutes/${user.institute}/`, {
                name: settings.name,
                contact_email: settings.contact_email,
                website_url: settings.website_url,
                theme_primary_color: settings.theme_primary_color
            });
            toast.success("Settings saved successfully.");
            // Refresh sidebar/other components
            window.dispatchEvent(new Event('instituteUpdate'));
        } catch (e) {
            console.error(e);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your institute's profile and contact information.
                </p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Institute Profile</CardTitle>
                    <CardDescription>
                        This information will be displayed publicly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="inst-name">Institute Name</Label>
                        <Input
                            id="inst-name"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input
                            id="contact-email"
                            value={settings.contact_email}
                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                            id="website"
                            value={settings.website_url}
                            onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                            placeholder="https://www.example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="theme">Theme Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="theme"
                                value={settings.theme_primary_color}
                                onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                                placeholder="e.g. #000000 or oklch(...)"
                            />
                            <div className="w-10 h-10 rounded border" style={{ backgroundColor: settings.theme_primary_color }}></div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
