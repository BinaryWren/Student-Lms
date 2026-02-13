"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, FileText, User, Calendar, ExternalLink, Loader2, CheckCircle, XCircle, Plus } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AdmissionForm } from "@/components/admission-form"

export default function AdmissionsPage() {
    const params = useParams()
    const router = useRouter()
    const [admissions, setAdmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [courseMode, setCourseMode] = useState<"ONLINE" | "OFFLINE">("OFFLINE")

    useEffect(() => {
        fetchAdmissions()
    }, [])

    const fetchAdmissions = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admissions/')
            setAdmissions(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load admissions")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/admissions/${id}/`, { status })
            toast.success(`Application ${status.toLowerCase()} successfully`)
            fetchAdmissions()
        } catch (error) {
            toast.error("Action failed")
        }
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admission Applications</h2>
                    <p className="text-muted-foreground">Review and manage online student registrations.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manual Student Admission</DialogTitle>
                            <DialogDescription>
                                Fill out the form below to manually register a student. This uses the same process as the public admission portal.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <AdmissionForm
                                isAdminMode={true}
                                defaultInstituteId={params.id as string}
                                onSuccess={() => {
                                    setIsAddOpen(false)
                                    fetchAdmissions()
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applicants..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Tabs value={courseMode} onValueChange={(v: any) => setCourseMode(v)} className="w-fit">
                                <TabsList className="bg-muted/50">
                                    <TabsTrigger value="OFFLINE" className="data-[state=active]:bg-background">Offline Apps</TabsTrigger>
                                    <TabsTrigger value="ONLINE" className="data-[state=active]:bg-background">Online Apps</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button variant="outline" onClick={fetchAdmissions}>
                                <Filter className="mr-2 h-4 w-4" /> Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admissions
                                    .filter(a => a.course_mode === courseMode)
                                    .filter(a => `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
                                    .length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No {courseMode.toLowerCase()} applications found.</TableCell></TableRow>
                                ) : (
                                    admissions
                                        .filter(a => a.course_mode === courseMode)
                                        .filter(a => `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
                                        .map((adm) => (
                                            <TableRow key={adm.id} className="group hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/institutes/${params.id}/admissions/${adm.id}`)}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                                            {adm.photo ? <img src={adm.photo} alt="p" className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full text-muted-foreground" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{adm.first_name} {adm.last_name}</div>
                                                            <div className="text-xs text-muted-foreground">{adm.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate">{adm.course_name || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={adm.course_mode === 'ONLINE' ? 'text-blue-500 border-blue-500' : 'text-orange-500 border-orange-500'}>
                                                        {adm.course_mode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{adm.batch_name || "N/A"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(adm.applied_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={adm.status === 'APPROVED' ? 'default' : adm.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {adm.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleAction(adm.id, 'APPROVED')} title="Approve">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleAction(adm.id, 'REJECTED')} title="Reject">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => router.push(`/institutes/${params.id}/admissions/${adm.id}`)} title="View Detail">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
