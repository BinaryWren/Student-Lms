"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function InstructorAttendancePage() {
    const [readmissions, setReadmissions] = useState<any[]>([])
    const [applications, setApplications] = useState<any[]>([])
    const [comments, setComments] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchApplications()
        fetchReadmissions()
    }, [])

    const fetchReadmissions = async () => {
        try {
            // Fetch Readmission Applications (Offline only, though backend filters for Instructor)
            const res = await api.get('/readmissions/')
            // Client side filter pending just in case
            setReadmissions(res.data.filter((r: any) => r.status === 'PENDING'))
        } catch (e) {
            console.error("Failed to fetch readmissions", e)
        }
    }

    const handleReadmissionAction = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        try {
            await api.post(`/readmissions/${id}/${action}/`, { comment: 'Processed by Instructor' });
            toast.success(`Request ${action}d`);
            fetchReadmissions();
        } catch (e) {
            toast.error("Failed to process request");
        }
    }

    const fetchApplications = async () => {
        try {
            // Fetch applications pending instructor review
            const res = await api.get('/attendance-applications/?status=PENDING_INSTRUCTOR')
            setApplications(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load applications")
        } finally {
            setLoading(false)
        }
    }

    const handleForward = async (appId: string) => {
        setProcessing(appId)
        try {
            await api.post(`/attendance-applications/${appId}/forward_to_admin/`, {
                comment: comments[appId] || "Recommended for approval."
            })
            toast.success("Application forwarded to Admin")
            // Remove from list
            setApplications(prev => prev.filter(app => app.id.toString() !== appId))
        } catch (e) {
            console.error(e)
            toast.error("Failed to forward application")
        } finally {
            setProcessing(null)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
                <p className="text-muted-foreground">Manage student attendance and reactivation requests.</p>
            </div>

            {/* Offline Course Readmissions */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Approvals (Offline Courses)</h2>
                {readmissions.length === 0 ? (
                    <div className="p-4 border rounded-md text-muted-foreground text-sm">No pending readmission requests for your offline courses.</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {readmissions.map(req => (
                            <Card key={req.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-base">{req.student_name}</CardTitle>
                                        <Badge variant="outline">Offline Course Lock</Badge>
                                    </div>
                                    <CardDescription>{req.course_title}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/50 p-3 rounded text-sm mb-4">
                                        <span className="font-semibold">Reason:</span> {req.reason}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleReadmissionAction(req.id, 'reject')}>Reject</Button>
                                        <Button size="sm" onClick={() => handleReadmissionAction(req.id, 'approve')}>Approve & Unlock</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <hr />

            {/* Standard Attendance Applications (Online Logic - Forwarding) */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Online Course Applications (Forward to Admin)</h2>
                {applications.length === 0 ? (
                    <div className="p-4 border rounded-md text-muted-foreground text-sm">No pending online course applications.</div>
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
                                        <Badge variant="outline" className="bg-blue-50">Requires Forwarding</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-muted p-4 rounded-md">
                                        <h4 className="font-semibold text-sm mb-1">Student Reason:</h4>
                                        <p className="text-sm">{app.reason}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Instructor Comment (for Admin)</label>
                                        <Textarea
                                            placeholder="E.g. Valid reason, recommended."
                                            value={comments[app.id] || ""}
                                            onChange={e => setComments(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button onClick={() => handleForward(app.id.toString())} disabled={processing === app.id.toString()}>
                                            {processing === app.id.toString() && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Forward to Admin
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
