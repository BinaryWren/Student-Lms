"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Search, Download, Filter, GraduationCap, TrendingUp, UserCheck, BookOpen, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GradebookGrid } from "@/components/gradebook-grid"

export default function GradebookPage() {
    return (
        <Suspense fallback={<div>Loading Gradebook...</div>}>
            <GradebookContent />
        </Suspense>
    )
}


function GradebookContent() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [courseData, setCourseData] = useState<Record<string, { assignments: any[], quizzes: any[] }>>({})

    // Grading State
    const [gradingSub, setGradingSub] = useState<any>(null)
    const [gradeValue, setGradeValue] = useState("")
    const [feedback, setFeedback] = useState("")

    // Detailed View State (List of students for an item)
    const [viewingItem, setViewingItem] = useState<{ id: string, type: 'ASSIGNMENT' | 'QUIZ', title: string } | null>(null)
    const [itemSubmissions, setItemSubmissions] = useState<any[]>([])
    const [itemsLoading, setItemsLoading] = useState(false)

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [coursesRes, assRes, quizRes] = await Promise.all([
                api.get('/courses/'),
                api.get('/assignments/?page_size=1000'),
                api.get('/quizzes/?page_size=1000')
            ])

            const fetchedCourses = coursesRes.data.results || coursesRes.data
            const allAss = assRes.data.results || assRes.data
            const allQuiz = quizRes.data.results || quizRes.data

            setCourses(fetchedCourses)

            // Organize data by course
            const dataMap: Record<string, { assignments: any[], quizzes: any[] }> = {}
            fetchedCourses.forEach((c: any) => {
                dataMap[c.id] = { assignments: [], quizzes: [] }
            })

            allAss.forEach((a: any) => {
                if (dataMap[a.course]) dataMap[a.course].assignments.push(a)
            })
            allQuiz.forEach((q: any) => {
                if (dataMap[q.course]) dataMap[q.course].quizzes.push(q)
            })

            setCourseData(dataMap)

        } catch (e) {
            console.error("Failed to load gradebook data", e)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }


    const fetchItemSubmissions = async (item: { id: string, type: 'ASSIGNMENT' | 'QUIZ', title: string }) => {
        setViewingItem(item)
        setItemsLoading(true)
        setItemSubmissions([])
        try {
            let res;
            if (item.type === 'ASSIGNMENT') {
                res = await api.get(`/submissions/?assignment=${item.id}`)
            } else {
                res = await api.get(`/quiz-attempts/?quiz=${item.id}`)
            }
            setItemSubmissions(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load submissions")
        } finally {
            setItemsLoading(false)
        }
    }

    const handleGrade = async () => {
        if (!gradingSub) return
        try {
            // Check if it's Assignment Submission or Quiz Attempt
            const isQuiz = gradingSub.hasOwnProperty('score') && !gradingSub.hasOwnProperty('file');
            // Better check: QuizAttempt has 'score', Submission has 'grade'. But Submission also has 'grade'.
            // QuizAttempt has 'quiz', Submission has 'assignment'.

            if (gradingSub.assignment) {
                await api.post(`/submissions/${gradingSub.id}/grade/`, {
                    grade: parseFloat(gradeValue),
                    feedback
                })
            } else {
                // Quiz Attempt grading (override)
                await api.post(`/quiz-attempts/${gradingSub.id}/submit/`, {
                    score_override: parseFloat(gradeValue)
                })
            }

            toast.success("Graded successfully!")
            setGradingSub(null)
            if (viewingItem) fetchItemSubmissions(viewingItem)
        } catch (e) {
            toast.error("Failed to save grade.")
        }
    }

    const renderAssessmentTable = (items: any[], type: 'ASSIGNMENT' | 'QUIZ') => {
        if (!items?.length) return <div className="p-4 text-center text-muted-foreground">No items found.</div>
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Max Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>{item.total_points || "N/A"}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => fetchItemSubmissions({ id: item.id, type, title: item.title })}>
                                    View Results
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient">Master Gradebook</h2>
                <p className="text-muted-foreground">Select a subject to view assessment results.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {courses.map(course => (
                    <AccordionItem key={course.id} value={course.id.toString()} className="border rounded-lg px-4 bg-card/50">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">{course.title}</span>
                                <Badge variant="secondary" className="font-normal text-muted-foreground">{course.code}</Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6">
                            <Tabs defaultValue="results" className="w-full">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="results">Overview & Grades</TabsTrigger>
                                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                    <TabsTrigger value="pre">Pre-Assessments</TabsTrigger>
                                    <TabsTrigger value="post">Post-Assessments</TabsTrigger>
                                </TabsList>

                                <TabsContent value="results" className="mt-4">
                                    <GradebookGrid courseId={course.id.toString()} assignments={courseData[course.id.toString()]?.assignments || []} quizzes={courseData[course.id.toString()]?.quizzes || []} />
                                </TabsContent>

                                <TabsContent value="assignments" className="mt-4">
                                    {renderAssessmentTable(
                                        courseData[course.id.toString()]?.assignments.filter((a: any) => a.assignment_type === 'REGULAR'),
                                        'ASSIGNMENT'
                                    )}
                                </TabsContent>
                                <TabsContent value="quizzes" className="mt-4">
                                    {renderAssessmentTable(
                                        courseData[course.id.toString()]?.quizzes.filter((q: any) => q.quiz_type === 'REGULAR'),
                                        'QUIZ'
                                    )}
                                </TabsContent>
                                <TabsContent value="pre" className="mt-4">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm text-muted-foreground">Pre-Assessment Quizzes</h4>
                                        {renderAssessmentTable(
                                            courseData[course.id.toString()]?.quizzes.filter((q: any) => q.quiz_type === 'PRE_ASSESSMENT'),
                                            'QUIZ'
                                        )}
                                        <h4 className="font-semibold text-sm text-muted-foreground pt-4">Pre-Assessment Assignments</h4>
                                        {renderAssessmentTable(
                                            courseData[course.id.toString()]?.assignments.filter((a: any) => a.assignment_type === 'PRE_ASSESSMENT'),
                                            'ASSIGNMENT'
                                        )}
                                    </div>
                                </TabsContent>
                                <TabsContent value="post" className="mt-4">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-sm text-muted-foreground">Post-Assessment Quizzes</h4>
                                        {renderAssessmentTable(
                                            courseData[course.id.toString()]?.quizzes.filter((q: any) => q.quiz_type === 'POST_ASSESSMENT'),
                                            'QUIZ'
                                        )}
                                        <h4 className="font-semibold text-sm text-muted-foreground pt-4">Post-Assessment Assignments</h4>
                                        {renderAssessmentTable(
                                            courseData[course.id.toString()]?.assignments.filter((a: any) => a.assignment_type === 'POST_ASSESSMENT'),
                                            'ASSIGNMENT'
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {/* Results Dialog */}
            <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Results: {viewingItem?.title}</DialogTitle>
                        <DialogDescription>
                            Student submissions and grades.
                        </DialogDescription>
                    </DialogHeader>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemsLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                            ) : itemSubmissions.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center">No submissions yet.</TableCell></TableRow>
                            ) : (
                                itemSubmissions.map((sub: any) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-bold">{sub.student_name || sub.student?.username || "Unknown"}</TableCell>
                                        <TableCell>{new Date(sub.submitted_at || sub.completed_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={(sub.grade !== null || sub.score !== null) ? "default" : "secondary"}>
                                                {sub.grade ?? sub.score ?? "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setGradingSub(sub)
                                                setGradeValue((sub.grade ?? sub.score ?? "").toString())
                                                setFeedback(sub.feedback || "")
                                            }}>
                                                Grade
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>

            {/* Grading Dialog */}
            <Dialog open={!!gradingSub} onOpenChange={(open) => !open && setGradingSub(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Grade</DialogTitle>
                        <DialogDescription>
                            {gradingSub?.student_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Score</Label>
                            <Input
                                type="number"
                                value={gradeValue}
                                onChange={e => setGradeValue(e.target.value)}
                            />
                        </div>
                        {viewingItem?.type === 'ASSIGNMENT' && (
                            <div className="space-y-2">
                                <Label>Feedback</Label>
                                <Textarea
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                />
                            </div>
                        )}
                        {gradingSub?.file && (
                            <Button variant="outline" className="w-full" asChild>
                                <a href={gradingSub.file} target="_blank" rel="noreferrer">View File</a>
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleGrade}>Save Grade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
