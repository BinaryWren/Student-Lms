"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Building2, MapPin, Mail, Phone, Globe } from "lucide-react"

export default function AdminEmployersPage() {
    const [employers, setEmployers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [newItem, setNewItem] = useState({
        company_name: "",
        industry: "",
        website: "",
        email: "",
        phone: "",
        description: ""
    })

    useEffect(() => {
        fetchEmployers()
    }, [])

    const fetchEmployers = async () => {
        try {
            const res = await api.get('/careers/employers/')
            setEmployers(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to fetch employers")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newItem.company_name) return toast.error("Company name is required")
        setUploading(true)
        try {
            await api.post('/careers/employers/', newItem)
            toast.success("Employer added successfully")
            setOpen(false)
            setNewItem({ company_name: "", industry: "", website: "", email: "", phone: "", description: "" })
            fetchEmployers()
        } catch (e) {
            console.error(e)
            toast.error("Failed to add employer")
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employer Directory</h1>
                    <p className="text-muted-foreground">Manage companies and recruitment partners.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Employer</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Employer</DialogTitle>
                            <DialogDescription>Add details for a company or recruiter.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input value={newItem.company_name} onChange={e => setNewItem({ ...newItem, company_name: e.target.value })} placeholder="Acme Inc." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Input value={newItem.industry} onChange={e => setNewItem({ ...newItem, industry: e.target.value })} placeholder="Tech / Finance" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input value={newItem.website} onChange={e => setNewItem({ ...newItem, website: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} placeholder="hr@company.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={newItem.phone} onChange={e => setNewItem({ ...newItem, phone: e.target.value })} placeholder="+1 234..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="About the company..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Employer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employers.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No Employers Found</h3>
                        <p className="text-muted-foreground">Add companies to start posting jobs.</p>
                    </div>
                ) : employers.map((emp) => (
                    <Card key={emp.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                {emp.company_name}
                            </CardTitle>
                            <CardDescription>{emp.industry || "Industry not specified"}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            {emp.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={emp.website} target="_blank" rel="noreferrer" className="hover:underline text-primary">{emp.website}</a></div>}
                            {emp.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {emp.email}</div>}
                            {emp.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {emp.phone}</div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
