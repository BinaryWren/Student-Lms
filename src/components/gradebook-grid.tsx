"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GradebookGridProps {
    courseId: string
    assignments: any[]
    quizzes: any[]
}

export function GradebookGrid({ courseId, assignments, quizzes }: GradebookGridProps) {
    const [students, setStudents] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [attempts, setAttempts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [courseId])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Course to get Batch ID
            const courseRes = await api.get(`/courses/${courseId}/`)
            const batchId = courseRes.data.batch

            // Fetch Enrollments (Students)
            const enrollRes = await api.get(`/enrollments/?batch=${batchId}`)
            const enrollments = enrollRes.data.results || enrollRes.data
            setStudents(enrollments.map((e: any) => e.student))

            // Fetch Submissions & Attempts
            // Note: Ideally filter by course, but for now fetching all for these assignments if possible
            // Client-side filtering strategy:
            const subRes = await api.get(`/submissions/?page_size=1000`)
            const attRes = await api.get(`/quiz-attempts/?page_size=1000`)

            const allSubs = subRes.data.results || subRes.data
            const allAtts = attRes.data.results || attRes.data

            // Filter relevant to this course's assignments/quizzes
            const assIds = assignments.map(a => a.id)
            const quizIds = quizzes.map(q => q.id)

            setSubmissions(allSubs.filter((s: any) => assIds.includes(s.assignment)))
            setAttempts(allAtts.filter((a: any) => quizIds.includes(a.quiz)))

        } catch (e) {
            console.error("Failed to load grid data", e)
        } finally {
            setLoading(false)
        }
    }

    const getGrade = (studentId: number, itemId: number, type: 'ASSIGNMENT' | 'QUIZ') => {
        if (type === 'ASSIGNMENT') {
            const sub = submissions.find(s => s.student === studentId && s.assignment === itemId)
            if (!sub) return "-"
            return sub.grade !== null ? sub.grade : (sub.submitted_at ? "Submitted" : "-")
        } else {
            const att = attempts.find(a => a.student === studentId && a.quiz === itemId)
            if (!att) return "-"
            return att.score !== null ? att.score : "-"
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    // Combine assignments and quizzes for columns
    const columns = [
        ...assignments.map(a => ({ id: a.id, title: a.title, type: 'ASSIGNMENT' as const })),
        ...quizzes.map(q => ({ id: q.id, title: q.title, type: 'QUIZ' as const }))
    ]

    if (students.length === 0) return <div className="p-4 text-center text-muted-foreground">No students enrolled.</div>

    return (
        <div className="border rounded-md">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[150px] sticky left-0 bg-background">Student Name</TableHead>
                            {columns.map(col => (
                                <TableHead key={`${col.type}-${col.id}`} className="min-w-[100px]">
                                    <div className="flex flex-col">
                                        <span>{col.title}</span>
                                        <span className="text-[10px] text-muted-foreground">{col.type}</span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium sticky left-0 bg-background">
                                    {student.first_name} {student.last_name}
                                    <div className="text-xs text-muted-foreground">{student.username}</div>
                                </TableCell>
                                {columns.map(col => {
                                    const grade = getGrade(student.id, col.id, col.type)
                                    return (
                                        <TableCell key={`${col.type}-${col.id}`}>
                                            <Badge variant={grade === "-" ? "outline" : (grade === "Submitted" ? "secondary" : "default")}>
                                                {grade}
                                            </Badge>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
