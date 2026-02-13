"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Save, Plus, Trash2, GripVertical, ImagePlus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter, useParams, useSearchParams } from "next/navigation"

interface ModuleData {
    id?: number;
    title: string;
    order: number;
    lessons: LessonData[];
}

interface LessonData {
    id?: number;
    title: string;
    content_type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
    order: number;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [batchId, setBatchId] = useState("");
    const [batches, setBatches] = useState<any[]>([]);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [modules, setModules] = useState<ModuleData[]>([
        { title: "Module 1: Introduction", order: 1, lessons: [] }
    ]);

    useEffect(() => {
        // Fetch batches to allow selecting one
        api.get('/batches/').then(res => setBatches(res.data)).catch(console.error);
    }, []);

    const handleAddModule = () => {
        setModules([...modules, { title: `Module ${modules.length + 1}`, order: modules.length + 1, lessons: [] }]);
    };

    const handleRemoveModule = (index: number) => {
        const newModules = [...modules];
        newModules.splice(index, 1);
        setModules(newModules);
    };

    const handleModuleTitleChange = (index: number, newTitle: string) => {
        const newModules = [...modules];
        newModules[index].title = newTitle;
        setModules(newModules);
    };

    const handleSave = async () => {
        if (!title || !code || !batchId) {
            toast.error("Please fill in required fields (Title, Code, Batch)");
            return;
        }

        try {
            // 1. Create Course using FormData (for image upload)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('code', code);
            formData.append('description', description);
            formData.append('batch', batchId);
            if (mode === 'ONLINE') {
                formData.append('is_online_course', 'true');
            }
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            const courseRes = await api.post('/courses/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const courseId = courseRes.data.id;

            // 2. Create Initial Modules sequentially
            for (const mod of modules) {
                await api.post('/modules/', {
                    course: courseId,
                    title: mod.title,
                    order: mod.order
                });
            }

            toast.success("Course and modules created!");
            router.push(`/institutes/${params.id}/courses/${courseId}`);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to save course");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="../courses">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
                        <p className="text-muted-foreground">Drafting "{title || 'Untitled Course'}"</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push('../courses')}>Discard</Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save Course
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Basic information about your course.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input id="title" placeholder="e.g. Introduction to Astrophysics" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Course Code</Label>
                                <Input id="code" placeholder="CS-101" value={code} onChange={e => setCode(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batch">Batch</Label>
                                <Select value={batchId} onValueChange={setBatchId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="What is this course about?" rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle>Curriculum</CardTitle>
                                <CardDescription>Organize modules (Lessons can be added after saving).</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleAddModule}>
                                <Plus className="mr-2 h-4 w-4" /> Add Module
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {modules.length === 0 ? (
                                <div className="py-10 text-center border-2 border-dashed rounded-lg">
                                    <p className="text-sm text-muted-foreground italic mb-4">You can add Modules here, and add Lessons (Videos) in the builder later.</p>
                                    <Button variant="outline" onClick={handleAddModule}>
                                        <Plus className="mr-2 h-4 w-4" /> Add First Module
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {modules.map((mod, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 border rounded-lg group">
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex-1 flex items-center gap-2">
                                                <Badge variant="outline" className="h-5">M{index + 1}</Badge>
                                                <Input
                                                    value={mod.title}
                                                    onChange={(e) => handleModuleTitleChange(index, e.target.value)}
                                                    className="h-8 border-none bg-transparent focus-visible:ring-0 font-medium p-0"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveModule(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" className="w-full border border-dashed py-8 text-muted-foreground hover:bg-muted/10" onClick={handleAddModule}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Another Module
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dev">Development</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Level</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="begin">Beginner</SelectItem>
                                        <SelectItem value="inter">Intermediate</SelectItem>
                                        <SelectItem value="adv">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thumbnail</CardTitle>
                            <CardDescription>Upload course cover image</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="border-2 border-dashed rounded-lg aspect-video flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden"
                                onClick={() => document.getElementById('thumb-upload')?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImagePlus className="h-8 w-8 mb-2" />
                                        <span className="text-xs">Click to upload</span>
                                    </>
                                )}
                                <input
                                    id="thumb-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setThumbnail(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
