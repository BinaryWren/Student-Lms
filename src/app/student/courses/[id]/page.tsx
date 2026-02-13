"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { PlayCircle, Lock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function CourseOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const [course, setCourse] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [showReadmission, setShowReadmission] = useState(false);
    const [reason, setReason] = useState("");

    useEffect(() => {
        async function fetch() {
            if (!courseId) return;
            try {
                const res = await api.get(`/courses/${courseId}/`);
                setCourse(res.data);

                // Fetch Enrollment
                const enRes = await api.get('/enrollments/');
                // Match enrollment by batch
                const myEnrollment = enRes.data.find((e: any) => e.batch === res.data.batch);
                if (myEnrollment) {
                    setEnrollment(myEnrollment);
                    if (myEnrollment.is_locked) {
                        setIsLocked(true);
                        setShowReadmission(true);
                    } else {
                        // Trigger access check/streak update
                        api.post(`/enrollments/${myEnrollment.id}/access/`).then(accRes => {
                            // If access response says locked (e.g. just triggered now)
                            // API might return 403, we should catch it.
                        }).catch(err => {
                            if (err.response && err.response.data.code === 'COURSE_LOCKED') {
                                setIsLocked(true);
                                setShowReadmission(true);
                            }
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetch();
    }, [courseId]);

    const handleSubmitReadmission = async () => {
        if (!reason) return toast.error("Please provide a reason");
        if (!enrollment) return;

        try {
            await api.post('/readmissions/', {
                enrollment: enrollment.id, // Primary key
                reason: reason
            });
            toast.success("Application submitted successfully");
            setShowReadmission(false);
            // Ideally Refresh or Show Pending State
        } catch (e) {
            toast.error("Failed to submit application");
        }
    }

    if (!course) return null;

    // Locked State UI
    if (isLocked) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="bg-destructive/10 p-6 rounded-full">
                    <Lock className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold">Access Locked</h1>
                <p className="text-muted-foreground max-w-md">
                    You have been locked out of this course due to inactivity (4+ days absence).
                    Please submit a readmission application to continue learning.
                </p>
                <Button onClick={() => setShowReadmission(true)} size="lg">Apply for Readmission</Button>

                <Dialog open={showReadmission} onOpenChange={setShowReadmission}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Readmission</DialogTitle>
                            <DialogDescription>
                                Explain why you were absent. Your instructor or admin will review this request.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="I was sick / I had an emergency..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <DialogFooter>
                            <Button onClick={handleSubmitReadmission}>Submit Application</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    // Find first lesson to start
    const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">{course.title}</h1>
                <p className="text-xl text-muted-foreground">{course.description}</p>
                <div className="flex gap-4 pt-4">
                    {firstLessonId && (
                        <Button size="lg" asChild>
                            <Link href={`/student/courses/${courseId}/lessons/${firstLessonId}`}>
                                <PlayCircle className="mr-2 h-5 w-5" /> Start Learning
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span>Modules</span>
                            <span className="font-bold">{course.modules?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Duration</span>
                            <span className="font-bold">~ 5 Hours</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-medium">{course.instructor_name}</p>
                        <p className="text-sm text-muted-foreground">Certified Instructor</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
