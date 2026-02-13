"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"

function CreateAssignmentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get pre-filled values from URL
    const courseId = searchParams.get("course")
    const typeParam = searchParams.get("type") || "REGULAR"

    const [form, setForm] = useState({
        title: "",
        description: "",
        course: courseId || "",
        due_date: "",
        total_points: "100",
        assignment_type: typeParam
    })

    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // If courseId is not provided, fetch courses to populate select
        if (!courseId) {
            fetchCourses();
        }
    }, [courseId])

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/')
            setCourses(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load courses")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.course) {
            toast.error("Please select a course")
            return
        }

        setLoading(true)
        try {
            await api.post('/assignments/', {
                ...form,
                course: parseInt(form.course),
                total_points: parseInt(form.total_points)
            })
            toast.success("Assignment created successfully!")
            router.back()
        } catch (e: any) {
            console.error(e)
            toast.error(e.response?.data?.error || "Failed to create assignment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-8 space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Create {form.assignment_type.replace('_', '-').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                    <CardDescription>
                        Add a new assessment for your course.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Mid-term Assessment"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                {courseId ? (
                                    <Input value={courseId} disabled />
                                ) : (
                                    <Select
                                        value={form.course}
                                        onValueChange={(val) => setForm({ ...form, course: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={`${c.id}`}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={form.assignment_type}
                                    onValueChange={(val) => setForm({ ...form, assignment_type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REGULAR">Regular Assignment</SelectItem>
                                        <SelectItem value="PRE_ASSESSMENT">Pre-Assessment</SelectItem>
                                        <SelectItem value="POST_ASSESSMENT">Post-Assessment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="datetime-local"
                                    required
                                    value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="points">Total Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    required
                                    min="0"
                                    value={form.total_points}
                                    onChange={(e) => setForm({ ...form, total_points: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                required
                                className="min-h-[100px]"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Assessment"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CreateAssignmentPage() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <CreateAssignmentContent />
        </Suspense>
    )
}
