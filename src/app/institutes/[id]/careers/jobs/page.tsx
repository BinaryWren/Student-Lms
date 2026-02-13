"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus, Briefcase, MapPin, Building2, Trash2 } from "lucide-react"

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [employers, setEmployers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [newItem, setNewItem] = useState({
        title: "",
        employer: "",
        location: "",
        job_type: "FULL_TIME",
        description: "",
        requirements: "",
        salary_range: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [jobRes, empRes] = await Promise.all([
                api.get('/careers/jobs/'),
                api.get('/careers/employers/')
            ])
            setJobs(jobRes.data.results || jobRes.data)
            setEmployers(empRes.data.results || empRes.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newItem.title) return toast.error("Title is required")
        if (!newItem.employer) return toast.error("Employer is required")

        setUploading(true)
        try {
            await api.post('/careers/jobs/', newItem)
            toast.success("Job posted successfully")
            setOpen(false)
            setNewItem({ title: "", employer: "", location: "", job_type: "FULL_TIME", description: "", requirements: "", salary_range: "" })
            fetchData()
        } catch (e) {
            console.error(e)
            toast.error("Failed to post job")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/careers/jobs/${id}/`)
            toast.success("Job deleted")
            setJobs(prev => prev.filter(j => j.id !== id))
        } catch (e) {
            toast.error("Failed to delete job")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
                    <p className="text-muted-foreground">Manage job listings visible to alumni.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Post New Job</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Post New Job</DialogTitle>
                            <DialogDescription>Create a job listing on behalf of an employer.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Frontend Engineer" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Employer</Label>
                                    <Select value={newItem.employer} onValueChange={v => setNewItem({ ...newItem, employer: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Employer" /></SelectTrigger>
                                        <SelectContent>
                                            {employers.map(emp => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>{emp.company_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Type</Label>
                                    <Select value={newItem.job_type} onValueChange={v => setNewItem({ ...newItem, job_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} placeholder="Remote / City" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Salary Range</Label>
                                    <Input value={newItem.salary_range} onChange={e => setNewItem({ ...newItem, salary_range: e.target.value })} placeholder="e.g. $80k - $100k" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Requirements</Label>
                                <Textarea value={newItem.requirements} onChange={e => setNewItem({ ...newItem, requirements: e.target.value })} rows={3} placeholder="- React.js&#10;- TypeScript" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Job
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {jobs.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No Jobs Posted</h3>
                        <p className="text-muted-foreground">Post jobs to help your alumni find opportunities.</p>
                    </div>
                ) : jobs.map((job) => (
                    <Card key={job.id} className="relative group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <Building2 className="h-3 w-3" /> {job.employer_name}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.job_type.replace('_', ' ')}</span>
                            </div>
                            <p className="line-clamp-2">{job.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
