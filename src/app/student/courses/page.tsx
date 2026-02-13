"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, User, ArrowRight, Star } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    instructor_name: string;
    progress_percentage: number;
}

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await api.get('/student/dashboard/');
                setCourses(res.data.active_courses);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading your courses...</div>

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 p-6"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-gradient">My Courses</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                    <Star className="size-4 text-yellow-500 fill-current" />
                    Continue your mastery path exactly where you left off.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
                {courses.length === 0 ? (
                    <motion.div variants={item} className="col-span-full text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                        <BookOpen className="size-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-xl font-bold">No courses yet</h3>
                        <p className="text-muted-foreground">You haven't been enrolled in any courses yet.</p>
                    </motion.div>
                ) : (
                    courses.map((course) => (
                        <motion.div variants={item} key={course.id}>
                            <Card className="glass-card group flex flex-col h-full overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                                <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                                            <BookOpen className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-primary/90 backdrop-blur-md border-none px-3 py-1 scale-90 group-hover:scale-100 transition-transform">
                                            {course.progress_percentage}% Done
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="p-5 pb-2">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                                        <div className="w-1 h-1 rounded-full bg-current" />
                                        In Progress
                                    </div>
                                    <CardTitle className="line-clamp-1 text-xl font-bold group-hover:text-primary transition-colors">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm mt-2 leading-relaxed h-10">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-0 flex-grow">
                                    <div className="flex items-center gap-3 text-sm font-medium mt-4">
                                        <div className="size-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                            <User className="size-4" />
                                        </div>
                                        <span className="text-muted-foreground">{course.instructor_name || 'Expert Instructor'}</span>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                                            <span>Path Completion</span>
                                            <span>{course.progress_percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress_percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-primary to-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-5 pt-0">
                                    <Button asChild className="w-full rounded-xl h-11 transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30">
                                        <Link href={`/student/courses/${course.id}`}>
                                            Resume Course <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    )
}
