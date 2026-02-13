"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Plus, MoreVertical, BookOpen, Clock } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function AssessmentsPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const res = await api.get('/quizzes/') // Assuming list view returns all quizzes for instructor
            setQuizzes(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load assessments")
        } finally {
            setLoading(false)
        }
    }

    const AssessmentList = ({ type }: { type: string }) => {
        const filtered = quizzes.filter(q => {
            if (type === 'ALL') return true;
            return q.quiz_type === type;
        });

        if (filtered.length === 0 && !loading) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No assessments found.</p>
                    <Button onClick={() => router.push('/instructor/quizzes/create')}>
                        Create One
                    </Button>
                </div>
            )
        }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                    <Card key={item.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="space-y-1">
                                <Badge variant={
                                    item.quiz_type === 'PRE_ASSESSMENT' ? 'default' :
                                        item.quiz_type === 'POST_ASSESSMENT' ? 'secondary' : 'outline'
                                }>
                                    {item.quiz_type?.replace('_', ' ') || 'REGULAR'}
                                </Badge>
                                <CardTitle className="pt-2 text-lg">{item.title}</CardTitle>
                            </div>
                            <Button size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Course ID: {item.course}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{item.time_limit_minutes} mins</span>
                                </div>
                                {item.passing_percentage > 0 && (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <FileQuestion className="h-4 w-4" />
                                        <span>Pass: {item.passing_percentage}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/instructor/quizzes/${item.id}`)}>
                                    Manage Questions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assessments & Quizzes</h2>
                    <p className="text-muted-foreground">Manage your Pre-Assessments, Post-Assessments, and Regular Quizzes.</p>
                </div>
                <Button onClick={() => router.push('/instructor/quizzes/create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Assessment
                </Button>
            </div>

            <Tabs defaultValue="ALL" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="ALL">All</TabsTrigger>
                    <TabsTrigger value="PRE_ASSESSMENT">Pre-Assessments</TabsTrigger>
                    <TabsTrigger value="POST_ASSESSMENT">Post-Assessments</TabsTrigger>
                    <TabsTrigger value="REGULAR">Regular Quizzes</TabsTrigger>
                </TabsList>

                <TabsContent value="ALL">
                    <AssessmentList type="ALL" />
                </TabsContent>
                <TabsContent value="PRE_ASSESSMENT">
                    <AssessmentList type="PRE_ASSESSMENT" />
                </TabsContent>
                <TabsContent value="POST_ASSESSMENT">
                    <AssessmentList type="POST_ASSESSMENT" />
                </TabsContent>
                <TabsContent value="REGULAR">
                    <AssessmentList type="REGULAR" />
                </TabsContent>
            </Tabs>
        </div>
    )
}
