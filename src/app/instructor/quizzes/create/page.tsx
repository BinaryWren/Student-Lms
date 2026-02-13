"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function CreateQuizPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedCourse = searchParams.get('course');
    const preSelectedType = searchParams.get('type') || "REGULAR";

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        course: preSelectedCourse || "",
        title: "",
        description: "",
        start_time: "",
        end_time: "", // Optional
        time_limit_minutes: "60",
        is_exam_mode: false,
        max_attempts: "1",
        quiz_type: preSelectedType,
        passing_percentage: "50"
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Instructor sees their courses
            // Assuming /courses/ endpoint returns only instructor's courses if logged in as instructor 
            // due to my updates in BaseInstituteViewSet.
            const res = await api.get('/courses/');
            setCourses(res.data.results || res.data);
        } catch (error) {
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.course || !formData.title || !formData.start_time) {
            toast.error("Please fill required fields (Course, Title, Start Time)");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                course: parseInt(formData.course),
                time_limit_minutes: parseInt(formData.time_limit_minutes),
                max_attempts: parseInt(formData.max_attempts),
                passing_percentage: parseInt(formData.passing_percentage),
                start_time: new Date(formData.start_time).toISOString(),
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
                questions: []
            };

            await api.post('/quizzes/', payload);
            toast.success("Assessment created successfully!");
            router.push(`/instructor/courses/${formData.course}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to create assessment");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;

    const typeLabel = formData.quiz_type === 'PRE_ASSESSMENT' ? 'Pre-Assessment' :
        formData.quiz_type === 'POST_ASSESSMENT' ? 'Post-Assessment' : 'Quiz';

    return (
        <div className="container max-w-2xl py-8 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold">Create {typeLabel}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Configure the settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select
                                value={formData.course}
                                onValueChange={(v) => setFormData({ ...formData, course: v })}
                                disabled={!!preSelectedCourse}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.title} ({c.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.quiz_type}
                                onValueChange={(v) => setFormData({ ...formData, quiz_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="REGULAR">Regular Quiz</SelectItem>
                                    <SelectItem value="PRE_ASSESSMENT">Pre-Assessment</SelectItem>
                                    <SelectItem value="POST_ASSESSMENT">Post-Assessment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder={formData.quiz_type === 'PRE_ASSESSMENT' ? "Course Pre-Assessment" : "Mid-term Exam"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Instructions..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time (Optional)</Label>
                            <Input
                                type="datetime-local"
                                value={formData.end_time}
                                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Time Limit (Min)</Label>
                            <Input
                                type="number"
                                value={formData.time_limit_minutes}
                                onChange={e => setFormData({ ...formData, time_limit_minutes: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Attempts</Label>
                            <Input
                                type="number"
                                value={formData.max_attempts}
                                onChange={e => setFormData({ ...formData, max_attempts: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Passing Check (%)</Label>
                            <Input
                                type="number"
                                min="0" max="100"
                                value={formData.passing_percentage}
                                onChange={e => setFormData({ ...formData, passing_percentage: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Switch
                            id="exam-mode"
                            checked={formData.is_exam_mode}
                            onCheckedChange={(c) => setFormData({ ...formData, is_exam_mode: c })}
                        />
                        <Label htmlFor="exam-mode">Exam Mode (Strict)</Label>
                    </div>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleCreate} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Quiz
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
