"use client"

import * as React from "react"
import { TrendingUp, Users, BookOpen, UserCheck, DollarSign, Loader2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "sonner"

export default function AnalyticsPage() {
    const [data, setData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/institute/analytics/')
            setData(res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load analytics")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (!data) return <div className="p-8">No data available</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">
                        In-depth analysis of your institute's performance.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Last 30 Days</Button>
                    <Button>Download Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.total_revenue}</div>
                        <p className="text-xs text-muted-foreground">
                            -
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.active_students}</div>
                        <p className="text-xs text-muted-foreground">
                            Current
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.course_completions}</div>
                        <p className="text-xs text-muted-foreground">
                            Certificates Issued
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.active_now || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Online Users
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Grade Performance</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Overview</CardTitle>
                            <CardDescription>
                                New student enrollments over the last few months.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                {data.overview.length === 0 ? <div className="h-full flex items-center justify-center text-muted-foreground">No Data</div> :
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.overview}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#888888"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                                cursor={{ fill: 'transparent' }}
                                            />
                                            <Bar dataKey="students" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                                        </BarChart>
                                    </ResponsiveContainer>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Averages</CardTitle>
                            <CardDescription>
                                Average scores by course.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px]">
                                {data.performance.length === 0 ? <div className="h-full flex items-center justify-center text-muted-foreground">No Performance Data</div> :
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.performance} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="course" type="category" width={100} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="avgScore" name="Avg Score (%)" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Student Activity</CardTitle>
                            <CardDescription>
                                Latest actions performed by students/faculty.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {data.recent_activity.length === 0 ? "No recent activity." : data.recent_activity.map((activity: any, index: number) => (
                                    <div key={index} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.user}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.action}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.time}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
