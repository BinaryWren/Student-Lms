"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import { AttendanceAction } from "@/components/attendance-action"
import { toast } from "sonner"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

interface Course {
    id: number;
    title: string;
    description: string;
    progress_percentage: number;
    thumbnail?: string;
}

interface Enrollment {
    id: number;
    batch_name: string;
    program_name: string;
}

interface Announcement {
    id: number;
    title: string;
    body: string;
    created_at: string;
}

interface DashboardSummary {
    active_courses: Course[];
    enrollments: Enrollment[];
    announcements: Announcement[];
    upcoming_exams: any[];
    upcoming_live_classes: any[];
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/student/dashboard/');
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>
    }

    if (!data) return <div className="p-8 text-center text-muted-foreground">Failed to load data.</div>

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6 p-2"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.username}! 👋</h1>
                    <p className="text-muted-foreground">You have {data.upcoming_exams.length + data.upcoming_live_classes.length} sessions/exams upcoming.</p>
                </div>
                <Link href="/student/courses">
                    <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform">
                        <PlayCircle className="mr-2 h-4 w-4" /> Resume Learning
                    </Button>
                </Link>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Live Classes */}
                {data.upcoming_live_classes.length > 0 && (
                    <Card className="col-span-full border-none shadow-xl bg-gradient-to-br from-primary to-indigo-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Upcoming Live Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.upcoming_live_classes.map((cls) => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    key={cls.id}
                                    className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col justify-between border border-white/20"
                                >
                                    <div>
                                        <h4 className="font-bold text-lg">{cls.title}</h4>
                                        <p className="text-sm opacity-80">{new Date(cls.start_time).toLocaleString()}</p>
                                    </div>
                                    <Button asChild variant="secondary" className="mt-4 w-full font-semibold">
                                        <a href={cls.join_url} target="_blank" rel="noreferrer">Join Class</a>
                                    </Button>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Continue Learning */}
                <Card className="col-span-2 glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        {data.active_courses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No active courses. Enroll in a batch to get started.</p>
                        ) : (
                            data.active_courses.map((course) => (
                                <motion.div
                                    variants={item}
                                    whileHover={{ y: -5 }}
                                    key={course.id}
                                    className="space-y-3 bg-card p-4 rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Course</Badge>
                                        <span className="text-xs text-muted-foreground">Active</span>
                                    </div>
                                    <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span className="font-medium">{course.progress_percentage}%</span>
                                        </div>
                                        <Progress value={course.progress_percentage} className="h-2" />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Link href={`/student/courses/${course.id}`} className="flex-1">
                                            <Button size="sm" className="w-full" variant="outline">Continue Module</Button>
                                        </Link>
                                        {user?.course_mode !== 'ONLINE' && (
                                            <AttendanceAction
                                                courseId={course.id.toString()}
                                                courseTitle={course.title}
                                                onMarked={() => { }}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Announcements / Due Soon */}
                <Card className="col-span-1 glass-card overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" /> Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.announcements.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent announcements.</p>
                        ) : (
                            data.announcements.map((ann) => (
                                <motion.div variants={item} key={ann.id} className="flex gap-4 items-start p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{ann.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ann.body}</p>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mt-2 block opacity-60">
                                            {new Date(ann.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Career Status Widget (For Alumni only) */}
            {user?.role === 'ALUMNI' && <CareerStatusWidget />}

            {/* Upcoming Exams */}
            {data.upcoming_exams.length > 0 && (
                <motion.div variants={item} className="space-y-4">
                    <h2 className="text-xl font-semibold">Upcoming Exams</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {data.upcoming_exams.map((exam: any) => (
                            <Card key={exam.id} className="hover:shadow-lg transition-all border-rose-100 dark:border-rose-900/20">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold">{exam.title}</CardTitle>
                                    <Badge variant="destructive" className="w-fit bg-red-100 text-red-600 hover:bg-red-200 border-none">Exam</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Time Limit: {exam.time_limit_minutes} mins</p>
                                    </div>
                                    <Link href="/student/quizzes">
                                        <Button className="w-full mt-4 rounded-lg" size="sm">Go to Exams</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

function CareerStatusWidget() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Additional data for unemployed alumni
    const [jobs, setJobs] = useState<any[]>([]);
    const [employers, setEmployers] = useState<any[]>([]);

    useEffect(() => {
        api.get('/careers/alumni/me/').then(res => {
            setStatus(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Fetch jobs/employers if unemployed
    useEffect(() => {
        if (status?.employment_status === 'UNEMPLOYED') {
            fetchOpportunities();
        }
    }, [status?.employment_status]);

    const fetchOpportunities = async () => {
        try {
            const [jobsRes, empRes] = await Promise.all([
                api.get('/careers/jobs/'),
                api.get('/careers/employers/')
            ]);
            setJobs(jobsRes.data.results || jobsRes.data);
            setEmployers(empRes.data.results || empRes.data);
        } catch (e) { console.error(e) }
    }

    const handleUpdate = async () => {
        if (!status) return;
        setUpdating(true);
        try {
            await api.patch(`/careers/alumni/${status.id}/`, {
                employment_status: status.employment_status,
                current_company: status.current_company,
                current_role: status.current_role
            });
            toast.success("Career status updated");
            // Refresh opportunities if switched to unemployed
            if (status.employment_status === 'UNEMPLOYED') fetchOpportunities();
        } catch (e) {
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    }

    if (loading || !status) return null;

    return (
        <motion.div variants={item} className="space-y-6">
            <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Alumni Status</Badge>
                        Update Your Career Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employment Status</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={status.employment_status || 'UNEMPLOYED'}
                                onChange={(e) => setStatus({ ...status, employment_status: e.target.value })}
                            >
                                <option value="UNEMPLOYED">Unemployed / Looking</option>
                                <option value="EMPLOYED">Employed</option>
                            </select>
                        </div>
                        {status.employment_status === 'EMPLOYED' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company</label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        placeholder="e.g. Google"
                                        value={status.current_company || ''}
                                        onChange={(e) => setStatus({ ...status, current_company: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role / Designation</label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        placeholder="e.g. Software Engineer"
                                        value={status.current_role || ''}
                                        onChange={(e) => setStatus({ ...status, current_role: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleUpdate} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Update Status
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Conditional Views for Unemployed Alumni */}
            {status.employment_status === 'UNEMPLOYED' && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Job Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommended Jobs for You</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {jobs.length === 0 ? <p className="text-muted-foreground text-sm">No jobs posted yet.</p> : jobs.slice(0, 3).map((job: any) => (
                                <div key={job.id} className="flex justify-between items-start border-b pb-2 last:border-0">
                                    <div>
                                        <h4 className="font-semibold text-sm">{job.title}</h4>
                                        <p className="text-xs text-muted-foreground">{job.employer_name}</p>
                                    </div>
                                    <Link href="/student/careers/jobs">
                                        <Button size="sm" variant="outline">View</Button>
                                    </Link>
                                </div>
                            ))}
                            {jobs.length > 0 && (
                                <Link href="/student/careers/jobs" className="block w-full">
                                    <Button className="w-full" variant="ghost">View All Jobs</Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employer Networking */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Connect with Employers</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {employers.length === 0 ? <p className="text-muted-foreground text-sm">No employer contacts available.</p> : employers.slice(0, 3).map((emp: any) => (
                                <div key={emp.id} className="flex flex-col gap-1 border-b pb-2 last:border-0">
                                    <h4 className="font-semibold text-sm">{emp.company_name}</h4>
                                    <p className="text-xs text-muted-foreground">{emp.email || "No email"}</p>
                                    <p className="text-xs text-muted-foreground">{emp.phone || "No phone"}</p>
                                    <Button size="sm" variant="link" className="h-6 px-0 justify-start">Contact HR</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </motion.div>
    )
}
