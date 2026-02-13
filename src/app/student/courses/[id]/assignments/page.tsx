"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, CheckCircle, Clock } from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function StudentCourseAssignments({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params)
    const [assignments, setAssignments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAssignments() {
            try {
                // We'll filter assignments by course on the client for now 
                // or update backend to accept course query param
                const res = await api.get('/assignments/')
                setAssignments(res.data.filter((a: any) => a.course == courseId))
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchAssignments()
    }, [courseId])

    const handleSubmit = async (assignmentId: number) => {
        // Mock submisison: in real app, show a dialog to upload file
        try {
            await api.post('/submissions/', {
                assignment: assignmentId,
                // Mock file URL or Base64 (Backend needs to handle this properly)
                file: 'https://example.com/submission.pdf'
            })
            toast.success("Assignment submitted successfully!")
            // Refresh would be good here
        } catch (e: any) {
            toast.error(e.response?.data?.error || "Failed to submit assignment.")
        }
    }

    if (loading) return <div className="p-8">Loading assignments...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Assignments</h1>
                <p className="text-muted-foreground">Complete your tasks and track your grades.</p>
            </div>

            <div className="grid gap-4">
                {assignments.map((assignment: any) => (
                    <Card key={assignment.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{assignment.title}</CardTitle>
                                    <CardDescription>Due: {new Date(assignment.due_date).toLocaleDateString()}</CardDescription>
                                </div>
                                <Badge variant="outline">Pending</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>
                        </CardContent>
                        <CardFooter className="bg-muted/5 flex justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>100 Points</span>
                            </div>
                            <Button size="sm" onClick={() => handleSubmit(assignment.id)}>
                                <Upload className="w-4 h-4 mr-2" /> Submit Work
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {assignments.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-dashed border-2">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No assignments found</h3>
                        <p className="text-muted-foreground">Relax! There are no pending tasks for this course yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
