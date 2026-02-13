"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
    id: number;
    text: string;
    question_type: 'MCQ' | 'SHORT';
    options: { id: string, text: string }[];
    points: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    time_limit_minutes: number;
    question_count: number;
    is_exam_mode: boolean;
}

export default function StudentQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetch() {
            try {
                // Since `QuizViewSet` filters by institute, we get all quizzes.
                // We might want to group by course or show all.
                const res = await api.get('/quizzes/');
                setQuizzes(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    const startQuiz = async (quizId: number) => {
        try {
            const res = await api.post(`/quizzes/${quizId}/start_attempt/`);
            const attempt = res.data;
            router.push(`/student/quizzes/${attempt.id}`); // This will correspond to the "Take Quiz" page
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to start quiz");
        }
    }

    if (loading) return <div className="p-8">Loading quizzes...</div>

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Quizzes & Exams</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                    <Card key={quiz.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-1 text-lg">{quiz.title}</CardTitle>
                                {quiz.is_exam_mode && <Badge variant="destructive">Exam</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{quiz.time_limit_minutes} mins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{quiz.question_count} Questions</span>
                                </div>
                            </div>

                            <Button onClick={() => startQuiz(quiz.id)} className="w-full">
                                Attempt Quiz
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
