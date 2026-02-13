"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Clock, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useState, useEffect } from "react"

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/instructor/analytics/').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8">Loading...</div>
    if (!data) return <div className="p-8">No data available</div>

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Course Analytics</h2>
                    <p className="text-muted-foreground">Track engagement and performance across your curriculum.</p>
                </div>
                <Button onClick={() => toast.info("Exporting data as CSV...")}>
                    Export Data
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                        <TrendingUp className="size-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.avg_completion}%</div>
                        <p className="text-xs text-muted-foreground mt-1">-</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
                        <Users className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.active_learners}</div>
                        <p className="text-xs text-muted-foreground mt-1">Real-time throughput</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
                        <Clock className="size-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.watch_time}</div>
                        <p className="text-xs text-muted-foreground mt-1">-</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
                        <BarChart3 className="size-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.drop_off_rate}</div>
                        <p className="text-xs text-muted-foreground mt-1">-</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Top Performing Courses</CardTitle>
                    <CardDescription>Courses with the highest engagement scores this week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.top_courses.length === 0 ? "No courses yet." : data.top_courses.map((course: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted-foreground/10">
                                <span className="font-bold">{course.name}</span>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium">Score: {course.score}</div>
                                    <Button variant="ghost" size="sm" className="rounded-full">
                                        Details <ArrowRight className="size-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
