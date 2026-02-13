"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { FileText, Link as LinkIcon, Download, Trash2, Plus, ExternalLink, Loader2 } from "lucide-react"

export default function AdminGalleryPage() {
    const params = useParams()
    const [items, setItems] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        item_type: "FILE",
        url: "",
        course: "all"
    })
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchItems()
        fetchCourses()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await api.get('/gallery/')
            if (Array.isArray(res.data)) {
                setItems(res.data)
            } else if (res.data.results) {
                setItems(res.data.results)
            } else {
                setItems([])
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to fetch documents")
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/')
            setCourses(res.data.results || res.data || [])
        } catch (e) {
            console.error("Failed to fetch courses", e)
        }
    }

    const handleCreate = async () => {
        if (!newItem.title) return toast.error("Title is required")
        if (newItem.item_type === 'LINK' && !newItem.url) return toast.error("URL is required")
        if (newItem.item_type === 'FILE' && !file) return toast.error("File is required")

        setUploading(true)
        const formData = new FormData()
        formData.append('title', newItem.title)
        formData.append('description', newItem.description)
        formData.append('item_type', newItem.item_type)
        if (newItem.item_type === 'LINK') {
            formData.append('url', newItem.url)
        } else if (file) {
            formData.append('file', file)
        }

        if (newItem.course && newItem.course !== 'all') {
            formData.append('course', newItem.course)
        }

        // Pass institute ID for super admin context
        if (params.id) {
            formData.append('institute', params.id as string)
        }

        try {
            await api.post('/gallery/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success("Item added successfully")
            setOpen(false)
            setNewItem({ title: "", description: "", item_type: "FILE", url: "", course: "all" })
            setFile(null)
            fetchItems()
        } catch (e) {
            console.error(e)
            toast.error("Failed to upload item")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return
        try {
            await api.delete(`/gallery/${id}/`)
            toast.success("Item deleted")
            setItems(prev => prev.filter(i => i.id !== id))
        } catch (e) {
            toast.error("Failed to delete item")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents Gallery</h1>
                    <p className="text-muted-foreground">Manage helping materials (PDFs, Links) for students.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Material</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Material</DialogTitle>
                            <DialogDescription>Upload a PDF or add an external link.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g. Course Syllabus 2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Course (Optional)</Label>
                                <Select
                                    value={newItem.course}
                                    onValueChange={v => setNewItem({ ...newItem, course: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="All Courses (General)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses (General)</SelectItem>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.title} ({c.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={newItem.item_type}
                                    onValueChange={v => setNewItem({ ...newItem, item_type: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FILE">File (PDF, Doc)</SelectItem>
                                        <SelectItem value="LINK">External Link</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {newItem.item_type === 'FILE' ? (
                                <div className="space-y-2" key="file-input-container">
                                    <Label>File</Label>
                                    <Input
                                        type="file"
                                        key="file-input"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2" key="url-input-container">
                                    <Label>URL</Label>
                                    <Input
                                        key="url-input"
                                        value={newItem.url}
                                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 ? (
                    <div className="col-span-full text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No documents added yet.
                    </div>
                ) : items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium truncate pr-2" title={item.title}>
                                {item.title}
                            </CardTitle>
                            {item.item_type === 'FILE' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <LinkIcon className="h-4 w-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            {item.course && (
                                <div className="mb-2">
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                        Course Specific
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] mb-4">
                                {item.description || "No description provided."}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <div className="text-xs text-muted-foreground">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    {item.item_type === 'FILE' && item.file ? (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={item.file} target="_blank" rel="noreferrer" download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    ) : item.url ? (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={item.url} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    ) : null}
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
