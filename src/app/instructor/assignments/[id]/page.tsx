"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ChevronLeft, Download, FileText, CheckCircle, XCircle } from "lucide-react"

export default function AssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id;

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Grading State
    const [gradingOpen, setGradingOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");

    // Change Request State
    const [requestOpen, setRequestOpen] = useState(false);
    const [changeReason, setChangeReason] = useState("");

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            const aRes = await api.get(`/assignments/${assignmentId}/`);
            setAssignment(aRes.data);
            const sRes = await api.get(`/submissions/?assignment=${assignmentId}`);
            setSubmissions(sRes.data.results || sRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const openGrading = (sub: any) => {
        setSelectedSubmission(sub);
        if (sub.grade !== null) {
            // If already graded, open Request Change Dialog
            setGrade(sub.grade.toString()); // Pre-fill current
            setChangeReason("");
            setRequestOpen(true);
        } else {
            // Normal Grading
            setGrade("");
            setFeedback("");
            setGradingOpen(true);
        }
    }

    const submitGrade = async () => {
        if (!selectedSubmission) return;
        try {
            await api.post(`/submissions/${selectedSubmission.id}/grade/`, {
                grade: parseFloat(grade),
                feedback
            });
            toast.success("Grade saved!");
            setGradingOpen(false);
            fetchData();
        } catch (error: any) {
            if (error.response?.data?.code === 'GRADE_LOCKED') {
                toast.error("Grade is locked. Please request a change.");
            } else {
                toast.error("Failed to save grade");
            }
        }
    }

    const submitChangeRequest = async () => {
        if (!selectedSubmission || !changeReason) {
            toast.error("Reason is required");
            return;
        }
        try {
            await api.post('/grade-change-requests/', {
                submission: selectedSubmission.id,
                new_grade: parseFloat(grade),
                reason: changeReason
            });
            toast.success("Request sent to Admin!");
            setRequestOpen(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || error.response?.data?.error || "Failed to send request";
            toast.error(msg);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!assignment) return <div className="p-8">Assignment not found</div>;

    return (
        <div className="container py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{assignment.title}</h1>
                        <p className="text-muted-foreground">{assignment.course_title} • Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submissions ({submissions.length})</CardTitle>
                    <CardDescription>Review and grade student work.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">
                                        {sub.student_details?.first_name} {sub.student_details?.last_name}
                                    </TableCell>
                                    <TableCell>{new Date(sub.submitted_at || sub.started_at).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {sub.file ? (
                                                <a
                                                    href={sub.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                                >
                                                    <FileText className="h-4 w-4" /> Download
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No File</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {sub.grade !== null ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {sub.grade} / {assignment.total_points}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant={sub.grade !== null ? "outline" : "default"} onClick={() => openGrading(sub)}>
                                            {sub.grade !== null ? "Request Change" : "Grade"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {submissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        No submissions yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Initial Grading Dialog */}
            <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        <DialogDescription>
                            Enter grade and feedback for {selectedSubmission?.student_details?.first_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Grade (Out of {assignment.total_points})</Label>
                            <Input
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                max={assignment.total_points}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Good work, but..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGradingOpen(false)}>Cancel</Button>
                        <Button onClick={submitGrade}>Save Grade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Request Dialog */}
            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogContent className="border-l-4 border-l-amber-500">
                    <DialogHeader>
                        <DialogTitle>Request Grade Update</DialogTitle>
                        <DialogDescription>
                            The grade is locked. Submit a request to the Institute Admin to update it.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-md">
                            Current Grade: <strong>{selectedSubmission?.grade}</strong>
                        </div>
                        <div className="space-y-2">
                            <Label>New Grade (Proposed)</Label>
                            <Input
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                max={assignment.total_points}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason for Change</Label>
                            <Textarea
                                value={changeReason}
                                onChange={(e) => setChangeReason(e.target.value)}
                                placeholder="e.g. Calculation error, reassessment..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
                        <Button onClick={submitChangeRequest} className="bg-amber-600 hover:bg-amber-700">Send Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
