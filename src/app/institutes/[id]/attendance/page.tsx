"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Check, X } from "lucide-react"

export default function AdminAttendancePage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [comments, setComments] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const res = await api.get('/attendance-applications/?status=PENDING_ADMIN')
            setApplications(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load applications")
        } finally {
            setLoading(false)
        }
    }

    const handleDecision = async (appId: string, decision: 'approve' | 'reject') => {
        setProcessing(appId)
        try {
            await api.post(`/attendance-applications/${appId}/${decision}/`, {
                comment: comments[appId] || ""
            })
            toast.success(`Application ${decision}d`)
            setApplications(prev => prev.filter(app => app.id.toString() !== appId))
        } catch (e) {
            console.error(e)
            toast.error(`Failed to ${decision} application`)
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance Approvals</h1>
            <p className="text-muted-foreground">Approve or reject student re-activation requests.</p>

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No pending approvals.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {applications.map(app => (
                        <Card key={app.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{app.student_name}</CardTitle>
                                        <CardDescription>{app.course_title}</CardDescription>
                                    </div>
                                    <Badge>Pending Approval</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-muted p-4 rounded-md">
                                        <h4 className="font-semibold text-sm mb-1">Student Reason:</h4>
                                        <p className="text-sm">{app.reason}</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                                        <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-300">Instructor Comment:</h4>
                                        <p className="text-sm">{app.instructor_comment}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admin Comment</label>
                                    <Textarea
                                        placeholder="Optional comment..."
                                        value={comments[app.id] || ""}
                                        onChange={e => setComments(prev => ({ ...prev, [app.id]: e.target.value }))}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => handleDecision(app.id.toString(), 'reject')} disabled={!!processing}>
                                        <X className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                    <Button onClick={() => handleDecision(app.id.toString(), 'approve')} disabled={!!processing}>
                                        <Check className="mr-2 h-4 w-4" /> Approve & Activate
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
