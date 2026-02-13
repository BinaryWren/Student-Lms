"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Users, BookOpen, MessageSquare, Calendar as CalendarIcon, FilePen, Activity, Plus, Mail } from "lucide-react"

export default function InstructorCourseDetail() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);

    // Notification State
    const [notifSubject, setNotifSubject] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Gradebook state
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [subsLoading, setSubsLoading] = useState(true);


    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // 1. Course Details
            const cRes = await api.get(`/courses/${courseId}/`);
            setCourse(cRes.data);

            // 2. Enrollments (Using Filter logic based on Batch if simpler API not available)
            // But we can filter EnrollmentViewSet by course indirectly if we had a filter.
            // For now, simpler to fetch course enrollments if endpoint exists.
            // If not, fetch all enrollments and filter (inefficient) or use the specific logic.
            // Let's assume we can GET /enrollments/?course=ID or we have to get batch first.
            if (cRes.data.batch) {
                const eRes = await api.get(`/enrollments/?batch=${cRes.data.batch}`);
                setEnrollments(eRes.data.results || eRes.data);
            }

            // 3. Assessments
            const aRes = await api.get(`/assignments/?course=${courseId}`);
            setAssignments(aRes.data.results || aRes.data);

            const qRes = await api.get(`/quizzes/?course=${courseId}`);
            setQuizzes(qRes.data.results || qRes.data);

            // 4. Submissions (Gradebook data for this course)
            fetchSubmissions();

        } catch (e) {
            console.error(e);
            toast.error("Failed to load course data");
        } finally {
            setLoading(false);
        }
    }

    const fetchSubmissions = async () => {
        setSubsLoading(true);
        try {
            const res = await api.get(`/submissions/?course=${courseId}`);
            setSubmissions(res.data.results || res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setSubsLoading(false);
        }
    }

    const handleSendNotification = async () => {
        if (!notifMessage) return toast.error("Message is required");
        setSending(true);
        try {
            const res = await api.post(`/courses/${courseId}/send_notification/`, {
                subject: notifSubject || `Update: ${course.title}`,
                message: notifMessage
            });
            toast.success(`Sent to ${res.data.count} students`);
            setNotifSubject("");
            setNotifMessage("");
        } catch (e: any) {
            toast.error(e.response?.data?.error || "Failed to send");
        } finally {
            setSending(false);
        }
    }

    if (loading) return <div>Loading Course...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">{course.code} • {course.batch_name || "No Batch"}</p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/instructor/courses`)}>Back to Courses</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                        <FilePen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quizzes.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="students" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrolled Students</CardTitle>
                            <CardDescription>Students currently active in this batch.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Enrolled Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollments.map((en: any) => (
                                        <TableRow key={en.id}>
                                            <TableCell className="font-medium">
                                                {en.student_details?.first_name} {en.student_details?.last_name || en.student_details?.username}
                                            </TableCell>
                                            <TableCell>{en.student_details?.email}</TableCell>
                                            <TableCell>{new Date(en.enrolled_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={en.active ? 'default' : 'secondary'}>
                                                    {en.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {enrollments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No students found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assessments">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Assignments */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Assignments</CardTitle>
                                    <CardDescription>Manage regular homework and projects.</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => router.push(`/instructor/assignments/create?course=${courseId}&type=REGULAR`)}>
                                    <Plus className="h-4 w-4 mr-2" /> Create
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {assignments.filter((a: any) => !a.assignment_type || a.assignment_type === 'REGULAR').map((a: any) => (
                                    <div key={a.id} className="flex justify-between items-center p-3 border rounded-md">
                                        <div>
                                            <p className="font-medium">{a.title}</p>
                                            <p className="text-xs text-muted-foreground">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline">{a.total_points} pts</Badge>
                                    </div>
                                ))}
                                {assignments.filter((a: any) => !a.assignment_type || a.assignment_type === 'REGULAR').length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
                            </CardContent>
                        </Card>

                        {/* Quizzes (Regular) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Quizzes & Exams</CardTitle>
                                    <CardDescription>Manage tests and exams.</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => router.push(`/instructor/quizzes/create?course=${courseId}&type=REGULAR`)}>
                                    <Plus className="h-4 w-4 mr-2" /> Create
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {quizzes.filter((q: any) => !q.quiz_type || q.quiz_type === 'REGULAR').map((q: any) => (
                                    <div key={q.id} className="flex justify-between items-center p-3 border rounded-md">
                                        <div>
                                            <p className="font-medium">{q.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {q.is_exam_mode ? "Exam Mode" : "Practice Quiz"}
                                            </p>
                                        </div>
                                        <Badge>{q.time_limit_minutes} min</Badge>
                                    </div>
                                ))}
                                {quizzes.filter((q: any) => !q.quiz_type || q.quiz_type === 'REGULAR').length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet.</p>}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="gradebook">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Course Gradebook</CardTitle>
                                <CardDescription>Recent submissions and student performance for this course.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/instructor/gradebook?course=${courseId}`)}>
                                Full Gradebook
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Work</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">View</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subsLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">Loading...</TableCell></TableRow>
                                    ) : submissions.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-4">No submissions found.</TableCell></TableRow>
                                    ) : (
                                        submissions.map((sub: any) => (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium">{sub.student_name || "Student"}</TableCell>
                                                <TableCell>Assignment #{sub.assignment}</TableCell>
                                                <TableCell>
                                                    {sub.grade !== null ? (
                                                        <Badge variant="default">{sub.grade}</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs">{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/instructor/gradebook`)}>
                                                        Grade
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="communication">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Announcement</CardTitle>
                            <CardDescription>
                                Send a notification to all {enrollments.length} enrolled students.
                                This will appear in their portal and be sent via email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    placeholder="e.g. Change in schedule"
                                    value={notifSubject}
                                    onChange={(e) => setNotifSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="min-h-[150px]"
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSendNotification} disabled={sending}>
                                {sending ? "Sending..." : "Send Announcement"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="events">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Course Events</CardTitle>
                            <Button size="sm" onClick={() => router.push(`/instructor/calendar?course=${courseId}`)}>
                                <CalendarIcon className="h-4 w-4 mr-2" /> Manage Calendar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                Calendar View Integration Here
                                {/* Could embed a mini calendar or list upcoming events */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
