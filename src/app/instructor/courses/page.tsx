"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Users, Edit, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch courses for the instructor
        // The CourseViewSet automatically filters courses by the logged-in instructor.
        api.get('/courses/').then(res => {
            setCourses(res.data.results || res.data)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }, [])

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground">Manage your curriculum and content.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-20">Loading courses...</div>
                ) : courses.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border-dashed border-2">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No courses found</h3>
                        <p className="text-muted-foreground mb-6">Contact your Institute Admin to be assigned to a course.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <Card key={course.id} className="overflow-hidden group hover:shadow-lg transition-all">
                            <div className="aspect-video bg-muted relative">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} className="object-cover w-full h-full" alt={course.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                        <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant={(course.status || 'DRAFT') === 'PUBLISHED' ? 'default' : 'secondary'}>
                                        {course.status || 'Draft'}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {course.students_count || 0} Students
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" /> {course.modules?.length || 0} Modules
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/5 p-4 flex gap-2">
                                <Button className="flex-1" asChild>
                                    <Link href={`/instructor/courses/${course.id}`}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" /> Manage Content
                                    </Link>
                                </Button>
                                <Button className="flex-1" variant="outline" asChild>
                                    <Link href={`/student/courses/${course.id}`}>
                                        Preview
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
