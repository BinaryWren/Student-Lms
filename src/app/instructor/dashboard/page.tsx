"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Users, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

export default function InstructorDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await api.get('/instructor/dashboard/');
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard summary...</div>
    if (!data) return <div className="p-8">Error loading data.</div>

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your courses and students.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.active_students}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total across batches</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.pending_grading.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.upcoming_live_classes.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>My Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.courses.map((course: any) => (
                                <Link key={course.id} href={`/instructor/courses/${course.id}/edit`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary font-bold">
                                            {course.code}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.title}</p>
                                            <p className="text-xs text-muted-foreground">ID: {course.id}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pending Grading</CardTitle>
                        <CardDescription>
                            Recent student submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data.pending_grading.map((sub: any) => (
                                <div key={sub.id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                        {sub.student_name?.[0] || 'S'}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{sub.student_name} submitted</p>
                                        <p className="text-xs text-muted-foreground">in Assignment #{sub.assignment}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="ml-auto" asChild>
                                        <Link href="/instructor/gradebook">Grade</Link>
                                    </Button>
                                </div>
                            ))}
                            {data.pending_grading.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
