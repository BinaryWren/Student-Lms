"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Star, Clock, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function QuizBankPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await api.get('/quizzes/');
            setQuizzes(res.data.results || res.data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    }

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon to the Quiz Bank.`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gradient">Quiz Bank</h2>
                    <p className="text-muted-foreground">Manage your repository of assessments and exams.</p>
                </div>
                <Button onClick={() => router.push('/instructor/quizzes/create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Quiz
                </Button>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search quizzes..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:border-primary/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <FileText className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{quiz.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span>Course: {quiz.course}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock className="size-3" /> {quiz.time_limit_minutes}m</span>
                                            <span>•</span>
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                {quiz.is_exam_mode ? "Exam" : "Practice"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="font-black">{quiz.questions_count || 0} Qs</Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleAction("Edit Quiz")}>
                                                <Edit2 className="mr-2 h-4 w-4" /> Edit Quiz
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => toast.error("Quiz deletion is restricted.")}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                        {quizzes.length === 0 && !loading && (
                            <div className="text-center py-10 text-muted-foreground">No quizzes found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
