"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Plus,
    Video,
    FileText,
    ChevronRight,
    ChevronDown,
    Trash2,
    Link as LinkIcon,
    Download,
    ExternalLink,
    BookOpen,
    ArrowLeft,
    MonitorPlay,
    FileCode,
    Layout
} from "lucide-react"
import api from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function ManageCourseContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const instituteId = params.id as string;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

    // Form states
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");

    const [isSubSectionModalOpen, setIsSubSectionModalOpen] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [subSectionTitle, setSubSectionTitle] = useState("");

    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [selectedSubSectionId, setSelectedSubSectionId] = useState<number | null>(null);
    const [resourceForm, setResourceForm] = useState({
        title: "",
        resource_type: "LINK" as "LINK" | "PDF" | "FILE",
        url: "",
        file: null as File | null
    });

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const res = await api.get(`/courses/${courseId}/`);
            setCourse(res.data);
            if (Object.keys(expandedModules).length === 0 && res.data.modules?.length > 0) {
                setExpandedModules({ [res.data.modules[0].id]: true });
            }
        } catch (error) {
            toast.error("Failed to load course details");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (modId: number) => {
        setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) {
            toast.error("Please enter a module title");
            return;
        }
        try {
            const res = await api.post('/modules/', {
                course: courseId,
                title: newModuleTitle,
                order: course.modules?.length + 1 || 1
            });
            toast.success("Module added");
            if (res.data?.id) {
                setExpandedModules(prev => ({ ...prev, [res.data.id]: true }));
            }
            setNewModuleTitle("");
            setIsModuleModalOpen(false);
            fetchCourseData();
        } catch (error) {
            toast.error("Failed to add module.");
        }
    };

    const handleAddSubSection = async () => {
        if (!subSectionTitle.trim() || !selectedModuleId) {
            toast.error("Sub-section title is required");
            return;
        }
        try {
            await api.post('/lessons/', {
                module: selectedModuleId,
                title: subSectionTitle,
                content_type: 'ARTICLE',
                content_url: "",
                content_body: "",
                order: 1
            });
            toast.success("Sub-section created");
            setSubSectionTitle("");
            setIsSubSectionModalOpen(false);
            fetchCourseData();
        } catch (error) {
            toast.error("Failed to add sub-section");
        }
    };

    const handleAddContent = async () => {
        if (!resourceForm.title.trim() || !selectedSubSectionId) {
            toast.error("Title is required");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('lesson', selectedSubSectionId.toString());
            formData.append('title', resourceForm.title);
            formData.append('resource_type', resourceForm.resource_type);
            if (resourceForm.resource_type === 'LINK') {
                formData.append('url', resourceForm.url);
            } else if (resourceForm.file) {
                formData.append('file_attachment', resourceForm.file);
            }

            await api.post('/resources/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(resourceForm.resource_type === 'LINK' ? "Video added" : "File attached");
            setResourceForm({ title: "", resource_type: "LINK", url: "", file: null });
            setIsResourceModalOpen(false);
            fetchCourseData();
        } catch (error) {
            toast.error("Failed to upload content");
        }
    };

    const handleDelete = async (type: 'modules' | 'lessons' | 'resources', id: number) => {
        if (!confirm(`Are you sure?`)) return;
        try {
            await api.delete(`/${type}/${id}/`);
            toast.success("Deleted");
            fetchCourseData();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <MonitorPlay className="h-10 w-10 text-primary animate-pulse" />
            <p className="text-muted-foreground animate-pulse text-sm">Loading Curriculum...</p>
        </div>
    );

    if (!course) return <div className="p-12 text-center">Course not found</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="ghost" size="sm" className="-ml-2 h-7" onClick={() => router.back()}>
                            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
                        </Button>
                        <Badge variant="outline" className="h-5 px-2 text-[10px] font-mono border-primary/20 text-primary uppercase">{course.code}</Badge>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h2>
                    <p className="text-muted-foreground">Add sub-sections to your modules to organize video lectures and study materials.</p>
                </div>
                <Button onClick={() => setIsModuleModalOpen(true)} className="rounded-full px-6 shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Add New Module
                </Button>
            </div>

            <div className="space-y-6">
                {course.modules?.length === 0 ? (
                    <Card className="border-dashed border-2 py-20 text-center">
                        <Plus className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-bold">No Modules Yet</h3>
                        <Button onClick={() => setIsModuleModalOpen(true)} className="mt-4">Create First Module</Button>
                    </Card>
                ) : (
                    course.modules?.sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                        <Card key={module.id} className="overflow-hidden border shadow-sm">
                            <div className="flex items-center gap-3 p-4 bg-muted/40 border-b">
                                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background border" onClick={() => toggleModule(module.id)}>
                                    {expandedModules[module.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                                <div className="flex-1 flex items-center gap-3">
                                    <span className="text-xs font-bold bg-primary text-primary-foreground h-6 w-6 flex items-center justify-center rounded-md">{module.order}</span>
                                    <span className="font-bold text-lg">{module.title}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Button size="sm" variant="outline" className="bg-background shadow-sm hover:bg-muted font-bold" onClick={() => { setSelectedModuleId(module.id); setIsSubSectionModalOpen(true); }}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Sub-section
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete('modules', module.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {expandedModules[module.id] && (
                                <CardContent className="p-0">
                                    {module.lessons?.length === 0 ? (
                                        <div className="p-12 text-center text-sm text-muted-foreground italic border-b">No sub-sections yet.</div>
                                    ) : (
                                        <div className="divide-y bg-background/50">
                                            {module.lessons?.map((lesson: any) => (
                                                <div key={lesson.id} className="p-6 ml-10 my-3 mr-4 rounded-xl border-l-4 border-l-primary/40 border bg-background group transition-all hover:shadow-md">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2.5 rounded-xl bg-primary/5 text-primary border border-primary/10">
                                                                <Layout className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-lg text-slate-800 tracking-tight">{lesson.title}</h4>
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">Sub-section Folder</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full" onClick={() => { setSelectedSubSectionId(lesson.id); setResourceForm({ ...resourceForm, resource_type: 'LINK' }); setIsResourceModalOpen(true); }}>
                                                                <Video className="mr-1.5 h-3.5 w-3.5" /> + Add Video
                                                            </Button>
                                                            <Button size="sm" className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-full" onClick={() => { setSelectedSubSectionId(lesson.id); setResourceForm({ ...resourceForm, resource_type: 'PDF' }); setIsResourceModalOpen(true); }}>
                                                                <FileText className="mr-1.5 h-3.5 w-3.5" /> + Add PDF/File
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete('lessons', lesson.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Items List */}
                                                    <div className="mt-5 space-y-2">
                                                        {lesson.resources?.length === 0 ? (
                                                            <div className="py-6 px-4 border border-dashed rounded-lg text-center bg-muted/5">
                                                                <p className="text-xs text-muted-foreground italic">This sub-section is empty. Use the buttons above to add videos or PDF files.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid gap-2">
                                                                {lesson.resources.map((res: any) => (
                                                                    <div key={res.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border shadow-sm group/item hover:border-primary/30 transition-colors">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`p-1.5 rounded-lg ${res.resource_type === 'LINK' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                                {res.resource_type === 'LINK' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-sm font-bold text-slate-700">{res.title}</span>
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase font-black">{res.resource_type === 'LINK' ? 'Video URL' : 'Downloadable File'}</Badge>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button onClick={() => handleDelete('resources', res.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity p-2">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Modals */}
            <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">New Module</DialogTitle>
                        <DialogDescription>A main chapter for your course structure.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Module Title</Label>
                            <Input placeholder="e.g. Fundamental Concepts" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setIsModuleModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddModule} className="rounded-full px-6">Create Module</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isSubSectionModalOpen} onOpenChange={setIsSubSectionModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">New Sub-section</DialogTitle>
                        <DialogDescription>A container for multiple videos and files.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Topic Name / Title</Label>
                            <Input placeholder="e.g. Introduction Lecture" value={subSectionTitle} onChange={e => setSubSectionTitle(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setIsSubSectionModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubSection} className="rounded-full px-6">Create Sub-section</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black flex items-center gap-2">
                            {resourceForm.resource_type === 'LINK' ? <><Video className="h-6 w-6 text-red-600" /> Add Video</> : <><FileText className="h-6 w-6 text-amber-600" /> Add PDF / File</>}
                        </DialogTitle>
                        <DialogDescription>Provide details for your content item.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Item Title</Label>
                            <Input placeholder={resourceForm.resource_type === 'LINK' ? "e.g. Video Part 1" : "e.g. Lecture Slides"} value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} />
                        </div>
                        {resourceForm.resource_type === 'LINK' ? (
                            <div className="space-y-2" key="link-input-container">
                                <Label className="font-bold">YouTube / Vimeo Embed URL</Label>
                                <Input placeholder="https://www.youtube.com/embed/XXXX" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} />
                            </div>
                        ) : (
                            <div className="space-y-2" key="file-input-container">
                                <Label className="font-bold">Upload Document</Label>
                                <Input type="file" className="cursor-pointer" onChange={e => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })} />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddContent} className="rounded-full px-6 bg-slate-900 text-white">Save Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
