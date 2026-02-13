"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, CheckCircle2, Clock, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    // New assignment form state
    const [newAssign, setNewAssign] = useState({
        title: '',
        description: '',
        course: '',
        due_date: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [assignRes, courseRes] = await Promise.all([
                api.get('/assignments/'),
                api.get('/courses/')
            ])
            setAssignments(assignRes.data.results || assignRes.data)
            setCourses(courseRes.data.results || courseRes.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            await api.post('/assignments/', {
                ...newAssign,
                course: parseInt(newAssign.course)
            })
            toast.success("Assignment created successfully!")
            setOpen(false)
            fetchData()
            setNewAssign({ title: '', description: '', course: '', due_date: '' })
        } catch (e) {
            console.error(e)
            toast.error("Failed to create assignment.")
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Assignments</h2>
                    <p className="text-muted-foreground">Review submissions and create new tasks for your students.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Assignment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                            <DialogDescription>
                                Add a new task for your students.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={newAssign.title} onChange={(e) => setNewAssign({ ...newAssign, title: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="course">Course</Label>
                                <Select onValueChange={(val) => setNewAssign({ ...newAssign, course: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={`${c.id}`}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input id="due_date" type="date" value={newAssign.due_date} onChange={(e) => setNewAssign({ ...newAssign, due_date: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea id="desc" value={newAssign.description} onChange={(e) => setNewAssign({ ...newAssign, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {assignments.map((item) => (
                    <Card key={item.id} className="glass-card hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>Course ID: {item.course}</CardDescription>
                            </div>
                            <Badge variant="outline">
                                Due: {new Date(item.due_date).toLocaleDateString()}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <FileText className="size-4" />
                                    <span>Submissions (Simulated)</span>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <Button size="sm" className="flex-1" asChild>
                                    <Link href={`/instructor/assignments/${item.id}`}>View Submissions</Link>
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => toast.info("More options coming soon.")}>
                                    <MoreVertical className="size-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {assignments.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border-dashed border-2">
                        No assignments created yet.
                    </div>
                )}
            </div>
        </div>
    )
}
