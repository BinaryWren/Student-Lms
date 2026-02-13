"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function ManageQuizPage() {
    const params = useParams()
    const router = useRouter()
    const quizId = params.id

    const [quiz, setQuiz] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // New Question Form State
    const [isAdding, setIsAdding] = useState(false)
    const [newQuestion, setNewQuestion] = useState({
        text: "",
        question_type: "MCQ",
        points: 1,
        options: [
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
            { id: "d", text: "" }
        ],
        correct_answer: "a" // Store ID of correct option
    })

    useEffect(() => {
        fetchQuizData()
    }, [])

    const fetchQuizData = async () => {
        try {
            const res = await api.get(`/quizzes/${quizId}/`)
            setQuiz(res.data)
            // Assuming the quiz serializer returns a list of questions or we fetch them separately
            // If the serializer doesn't support nested questions fully, we might need a separate endpoint.
            // But let's check if 'questions' field exists and populated.
            // If it's ManyToMany and returns IDs, we might need to fetch details.
            // Let's assume for now we might need to fetch questions details.

            // Actually, usually detail view gives questions. 
            // If not, we'd GET /questions/?quiz={quizId}
            // Let's look at backend later. For now assume quiz.questions is list of objects.

            // If quiz.questions are just IDs, we need to fetch them.
            // Let's rely on what we get.
            setQuestions(res.data.questions || [])

        } catch (e) {
            toast.error("Failed to load quiz")
            router.push("/instructor/assessments")
        } finally {
            setLoading(false)
        }
    }

    const handleAddQuestion = async () => {
        if (!newQuestion.text) {
            toast.error("Question text is required")
            return
        }

        // Prepare options
        const validOptions = newQuestion.options.filter(o => o.text.trim() !== "")
        if (newQuestion.question_type === 'MCQ' && validOptions.length < 2) {
            toast.error("MCQ must have at least 2 options")
            return
        }

        try {
            // We need to create the Question first 
            // And then associate it with the Quiz? 
            // Or the backend handles creating question and adding to quiz if we pass quiz_id?
            // Usually: POST /questions/ { ...data, quiz: quizId } if Question has FK to Quiz (it has FK to QuestionBank usually).
            // But wait, the model showed Question.bank -> QuestionBank.
            // Quiz -> ManyToMany -> Question.

            // So we likely need to:
            // 1. Create Question in a "Default Bank" for this course/instructor?
            // 2. Or does the backend allow creating a question directly for a Quiz?

            // Let's try to POST to /questions/ with a "quiz_id" we inject? 
            // Or we modify the backend to handle "adhoc" questions.
            // Let's assume we can create a Question and then PATCH the quiz to add it.

            // But 'Question' requires a 'bank'.
            // Instructor workflow usually implies a hidden "Course Question Bank".

            // Workaround: We will first ensure there is a QuestionBank for this course.
            // Then create question there.
            // Then add to quiz. 

            // Simplify: Let's assume we send the payload to an endpoint like `/quizzes/${quizId}/add_question/` 
            // OR we'll handle the logic here.

            // Let's assume there's a Bank for this course. If not, we create one.
            // For now, let's just try to create a question and see if we can attach it.

            // Better: Let's implement an action on the ViewSet: `add_question`

            const payload = {
                text: newQuestion.text,
                question_type: newQuestion.question_type,
                points: newQuestion.points,
                options: validOptions,
                correct_answer: { id: newQuestion.correct_answer }
                // bank: ??? We need a bank ID.
            }

            // If we can't create standalone questions easily, let's use a custom action I'll add to backend.
            await api.post(`/quizzes/${quizId}/add_question/`, payload)

            toast.success("Question added!")
            setIsAdding(false)
            fetchQuizData() // Refresh

            // Reset form
            setNewQuestion({
                text: "",
                question_type: "MCQ",
                points: 1,
                options: [
                    { id: "a", text: "" },
                    { id: "b", text: "" },
                    { id: "c", text: "" },
                    { id: "d", text: "" }
                ],
                correct_answer: "a"
            })

        } catch (e: any) {
            console.error(e)
            const msg = e.response?.data?.error || "Failed to add question"
            toast.error(msg)
        }
    }

    const handleDeleteQuestion = async (qId: number) => {
        if (!confirm("Remove this question?")) return
        try {
            await api.post(`/quizzes/${quizId}/remove_question/`, { question_id: qId })
            toast.success("Question removed")
            fetchQuizData()
        } catch (e) {
            toast.error("Failed to remove question")
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                    <p className="text-muted-foreground">{quiz.quiz_type} • {quiz.questions?.length || 0} Questions</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Questions</CardTitle>
                    <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions.length === 0 && !isAdding && (
                        <p className="text-center text-muted-foreground py-8">No questions added yet.</p>
                    )}

                    {questions.map((q: any, i: number) => (
                        <div key={q.id} className="p-4 border rounded-lg flex justify-between items-start bg-card">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-muted-foreground">Q{i + 1}.</span>
                                    <span className="font-medium">{q.text}</span>
                                    <Badge variant="outline">{q.points} pts</Badge>
                                </div>
                                <div className="pl-6 space-y-1">
                                    {q.options?.map((opt: any) => (
                                        <div key={opt.id} className={`flex items-center gap-2 text-sm ${q.correct_answer?.id === opt.id ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                                            {q.correct_answer?.id === opt.id && <CheckCircle2 className="h-3 w-3" />}
                                            <span>{opt.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteQuestion(q.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    {isAdding && (
                        <div className="border rounded-lg p-4 bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">New Question</h3>
                            </div>

                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <Textarea
                                    value={newQuestion.text}
                                    onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={newQuestion.question_type}
                                        onValueChange={v => setNewQuestion({ ...newQuestion, question_type: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                            <SelectItem value="SHORT">Short Answer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Points</Label>
                                    <Input
                                        type="number"
                                        value={newQuestion.points}
                                        onChange={e => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {newQuestion.question_type === 'MCQ' && (
                                <div className="space-y-3">
                                    <Label>Options</Label>
                                    {newQuestion.options.map((opt, idx) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correct"
                                                checked={newQuestion.correct_answer === opt.id}
                                                onChange={() => setNewQuestion({ ...newQuestion, correct_answer: opt.id })}
                                                className="w-4 h-4"
                                            />
                                            <Input
                                                value={opt.text}
                                                onChange={e => {
                                                    const newOpts = [...newQuestion.options]
                                                    newOpts[idx].text = e.target.value
                                                    setNewQuestion({ ...newQuestion, options: newOpts })
                                                }}
                                                placeholder={`Option ${opt.id.toUpperCase()}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={handleAddQuestion}>
                                    <Save className="mr-2 h-4 w-4" /> Save Question
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
