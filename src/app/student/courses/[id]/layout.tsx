"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Circle, PlayCircle, FileText, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CourseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams();
    const courseId = params.id;
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // We need to fetch the course details including modules and lessons
    useEffect(() => {
        async function fetchCourse() {
            if (!courseId) return;
            try {
                const res = await api.get(`/courses/${courseId}/`);
                setCourse(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCourse();
    }, [courseId]);

    if (loading) return <div className="flex h-full items-center justify-center">Loading course...</div>
    if (!course) return <div className="flex h-full items-center justify-center">Course not found</div>

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Course Content Sidebar - Fixed Width */}
            <div className="w-80 border-r bg-muted/10 hidden md:flex flex-col">
                <div className="p-4 border-b bg-background">
                    <h2 className="font-semibold line-clamp-1">{course.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{course.progress_percentage}% Complete</span>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        <Accordion type="multiple" defaultValue={course.modules.map((m: any) => `item-${m.id}`)} className="w-full">
                            {course.modules.sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                                <AccordionItem key={module.id} value={`item-${module.id}`}>
                                    <AccordionTrigger className="text-sm font-medium hover:no-underline px-2">
                                        {module.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-1">
                                            {module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                                                <Link
                                                    key={lesson.id}
                                                    href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                                                    className={cn(
                                                        "flex items-center gap-3 p-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                        // Highlight active logic could go here
                                                    )}
                                                >
                                                    {lesson.is_completed ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    )}

                                                    <div className="flex-1 line-clamp-1">
                                                        {lesson.title}
                                                    </div>

                                                    {lesson.content_type === 'VIDEO' && <PlayCircle className="w-3 h-3 opacity-50" />}
                                                    {lesson.content_type === 'ARTICLE' && <FileText className="w-3 h-3 opacity-50" />}
                                                </Link>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <div className="mt-8 space-y-4">
                            <h3 className="px-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">Assessments</h3>
                            <div className="space-y-1">
                                <Link
                                    href={`/student/courses/${courseId}/assignments`}
                                    className="flex items-center gap-3 p-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Assignments</span>
                                </Link>
                                <Link
                                    href={`/student/courses/${courseId}/quizzes`}
                                    className="flex items-center gap-3 p-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Quizzes</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-background">
                {children}
            </div>
        </div>
    )
}
