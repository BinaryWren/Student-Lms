"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { User, Mail, GraduationCap, Github, Linkedin, Globe, Save, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function AlumniProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newSkill, setNewSkill] = useState("")

    useEffect(() => {
        api.get('/careers/alumni/').then(res => {
            // Viewset returns list, but for ALUMNI role it's filtered to self
            if (res.data.length > 0) setProfile(res.data[0])
        }).catch(err => {
            console.error(err)
            toast.error("Failed to load profile")
        }).finally(() => setLoading(false))
    }, [])

    const handleSave = () => {
        setSaving(true)
        api.patch(`/careers/alumni/${profile.id}/`, profile).then(() => {
            toast.success("Profile updated successfully")
        }).catch(err => {
            console.error(err)
            toast.error("Update failed")
        }).finally(() => setSaving(false))
    }

    const addSkill = () => {
        if (!newSkill.trim()) return
        if (profile.skills.includes(newSkill)) return
        setProfile({ ...profile, skills: [...profile.skills, newSkill] })
        setNewSkill("")
    }

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) })
    }

    if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-[400px] w-full" /></div>
    if (!profile) return <div className="p-8 text-center">No alumni profile found.</div>

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Professional Profile</h2>
                    <p className="text-muted-foreground">Manage your alumni identity and career details.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Basics */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Basics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input value={profile.full_name} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Graduation Date</label>
                            <Input value={profile.graduation_date} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Company</label>
                            <Input
                                value={profile.current_company || ""}
                                onChange={(e) => setProfile({ ...profile, current_company: e.target.value })}
                                placeholder="Where do you work?"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Role</label>
                            <Input
                                value={profile.current_role || ""}
                                onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                                placeholder="Job Title"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Right Col: Links & Bio */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                value={profile.bio || ""}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Tell employers about yourself..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium">Skills</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add skill (e.g. React)"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <Button variant="outline" size="icon" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.skills.map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                                        {skill}
                                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(skill)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" /> Portfolio URL</label>
                                <Input
                                    value={profile.portfolio_url || ""}
                                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                                    placeholder="https://yourportfolio.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn Profile</label>
                                <Input placeholder="https://linkedin.com/in/..." />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
