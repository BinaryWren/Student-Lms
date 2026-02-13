"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, Play, FileText, CheckCircle2, ChevronDown, ChevronRight, Video, File, Trash2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CourseEditor({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const courseId = params.id

    const [course, setCourse] = useState<any>(null)
    const [modules, setModules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form States
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")

    // Module Dialog
    const [isAddModuleOpen, setIsAddModuleOpen] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState("")

    // Lesson Dialog
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
    const [newLessonTitle, setNewLessonTitle] = useState("")
    const [newLessonType, setNewLessonType] = useState("VIDEO")
    const [lessonUrl, setLessonUrl] = useState("")
    const [lessonBody, setLessonBody] = useState("")
    const [lessonFile, setLessonFile] = useState<File | null>(null)

    useEffect(() => {
        fetchCourseData()
    }, [courseId])

    const fetchCourseData = async () => {
        try {
            const courseRes = await api.get(`/courses/${courseId}/`)
            setCourse(courseRes.data)
            setTitle(courseRes.data.title)
            setDescription(courseRes.data.description)

            // Fetch modules
            const modRes = await api.get(`/modules/?course=${courseId}`)
            const formattedModules = await Promise.all(modRes.data.results ? modRes.data.results.map(async (m: any) => {
                // Fetch lessons for each module if not included
                try {
                    const lRes = await api.get(`/lessons/?module=${m.id}`)
                    return { ...m, lessons: lRes.data.results || lRes.data }
                } catch {
                    return { ...m, lessons: [] }
                }
            }) : (modRes.data || []).map(async (m: any) => {
                try {
                    const lRes = await api.get(`/lessons/?module=${m.id}`)
                    return { ...m, lessons: lRes.data.results || lRes.data }
                } catch {
                    return { ...m, lessons: [] }
                }
            }));

            setModules(formattedModules)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load course details")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        try {
            await api.patch(`/courses/${courseId}/`, {
                title,
                description,
                price: parseFloat(price) || 0
            })
            toast.success("Course settings saved")
        } catch (error) {
            toast.error("Failed to save settings")
        }
    }

    const handleAddModule = async () => {
        if (!newModuleTitle) return
        try {
            await api.post('/modules/', {
                course: courseId,
                title: newModuleTitle,
                order: modules.length + 1
            })
            toast.success("Module created")
            setIsAddModuleOpen(false)
            setNewModuleTitle("")
            fetchCourseData()
        } catch (error) {
            toast.error("Failed to create module")
        }
    }

    const handleAddLesson = async () => {
        if (!newLessonTitle || !selectedModuleId) return
        try {
            const targetModule = modules.find(m => m.id === selectedModuleId)
            const currentOrder = targetModule?.lessons?.length || 0;

            await api.post('/lessons/', {
                module: selectedModuleId,
                title: newLessonTitle,
                content_type: newLessonType,
                order: currentOrder + 1,
                content_url: lessonUrl,
                content_body: lessonBody
            })
            toast.success("Lesson created")
            setIsAddLessonOpen(false)
            setNewLessonTitle("")
            setLessonUrl("")
            setLessonBody("")
            fetchCourseData()
        } catch (error) {
            toast.error("Failed to create lesson")
        }
    }

    const handleDeleteModule = async (id: number) => {
        if (!confirm("Are you sure? This will delete all lessons in this module.")) return;
        try {
            await api.delete(`/modules/${id}/`)
            toast.success("Module deleted")
            fetchCourseData()
        } catch (error) {
            toast.error("Failed to delete module")
        }
    }

    const handleDeleteLesson = async (id: number) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            await api.delete(`/lessons/${id}/`)
            toast.success("Lesson deleted")
            fetchCourseData()
        } catch (error) {
            toast.error("Failed to delete lesson")
        }
    }

    if (loading) return <div className="p-8 text-center">Loading editor...</div>

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                    <p className="text-muted-foreground">Manage modules, lessons, and course settings.</p>
                </div>
                <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                </Button>
            </div>

            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="content">Course Content</TabsTrigger>
                    <TabsTrigger value="settings">General Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Modules & Lessons</CardTitle>
                                <CardDescription>Organize your course into logical steps.</CardDescription>
                            </div>
                            <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" /> Add Module
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Module</DialogTitle>
                                        <DialogDescription>Create a new section for your course.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Module Title</Label>
                                            <Input
                                                value={newModuleTitle}
                                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                                placeholder="e.g. Introduction to Python"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddModule}>Create Module</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {modules.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No modules yet. Click "Add Module" to start.
                                </div>
                            ) : modules.map((module: any, index: number) => (
                                <div key={module.id} className="border rounded-lg p-4 bg-muted/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <div className="bg-primary/10 text-primary h-6 w-6 rounded flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            {module.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteModule(module.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Dialog open={isAddLessonOpen && selectedModuleId === module.id} onOpenChange={(open) => {
                                                setIsAddLessonOpen(open)
                                                if (open) setSelectedModuleId(module.id)
                                                else setSelectedModuleId(null)
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedModuleId(module.id)}>
                                                        <Plus className="h-4 w-4 mr-1" /> Add Lesson
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Lesson to: {module.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label>Lesson Title</Label>
                                                            <Input
                                                                value={newLessonTitle}
                                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                                placeholder="e.g. Setting up environment"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Type</Label>
                                                            <Select value={newLessonType} onValueChange={setNewLessonType}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="VIDEO">Video Lesson</SelectItem>
                                                                    <SelectItem value="ARTICLE">Article / Text</SelectItem>
                                                                    <SelectItem value="QUIZ">Quiz</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {newLessonType === 'VIDEO' && (
                                                            <div className="space-y-2">
                                                                <Label>Video URL</Label>
                                                                <Input
                                                                    value={lessonUrl}
                                                                    onChange={(e) => setLessonUrl(e.target.value)}
                                                                    placeholder="e.g. https://youtube.com/..."
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            <Label>
                                                                {newLessonType === 'VIDEO' ? 'Video Description / Notes' : 'Lesson Content'}
                                                            </Label>
                                                            <Textarea
                                                                value={lessonBody}
                                                                onChange={(e) => setLessonBody(e.target.value)}
                                                                placeholder={newLessonType === 'VIDEO' ? "Add notes or a summary to appear below the video..." : "Write your lesson content here..."}
                                                                rows={5}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handleAddLesson}>Add Lesson</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                    <div className="space-y-2 ml-8">
                                        {(!module.lessons || module.lessons.length === 0) && (
                                            <p className="text-sm text-muted-foreground italic">No lessons in this module.</p>
                                        )}
                                        {module.lessons && module.lessons.map((lesson: any, lIndex: number) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-2 bg-background border rounded hover:border-primary cursor-pointer transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    {lesson.content_type === 'VIDEO' ? (
                                                        <Video className="h-4 w-4 text-blue-500" />
                                                    ) : (
                                                        <FileText className="h-4 w-4 text-green-500" />
                                                    )}
                                                    <span className="text-sm font-medium">{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-xs text-muted-foreground uppercase font-bold mr-2">Edit</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteLesson(lesson.id)
                                                    }}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold">Course Title</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-bold">Full Description</label>
                                <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
