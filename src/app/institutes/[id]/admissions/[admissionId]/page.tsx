"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ChevronLeft,
    Download,
    Mail,
    Phone,
    Linkedin,
    Calendar,
    Briefcase,
    MapPin,
    User,
    Users,
    CheckCircle,
    XCircle,
    FileText
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

export default function AdmissionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [admission, setAdmission] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/admissions/${params.admissionId}/`)
                setAdmission(res.data)
            } catch (err) {
                toast.error("Failed to load application details")
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [params.admissionId])

    const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/admissions/${params.admissionId}/`, { status })
            toast.success(`Application ${status.toLowerCase()}ed`)
            setAdmission({ ...admission, status })
        } catch (error) {
            toast.error("Action failed")
        }
    }


    if (loading) return <div className="space-y-6"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-[400px] w-full" /></div>
    if (!admission) return <div>Record not found</div>

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{admission.first_name} {admission.last_name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{admission.category}</Badge>
                            <span className="text-muted-foreground text-sm">Applied on {new Date(admission.applied_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => handleAction('REJECTED')} disabled={admission.status === 'REJECTED'}>
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('APPROVED')} disabled={admission.status === 'APPROVED'}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Admission
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 shadow-md border-primary/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-32 h-32 rounded-2xl overflow-hidden border-4 border-muted shadow-xl mb-4">
                            {admission.photo ? (
                                <img src={admission.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="bg-muted w-full h-full flex items-center justify-center text-muted-foreground"><User className="h-12 w-12" /></div>
                            )}
                        </div>
                        <CardTitle>Applicant Profile</CardTitle>
                        <CardDescription>Status: <Badge className="ml-1 uppercase">{admission.status}</Badge></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{admission.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{admission.mobile_number}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>DOB: {new Date(admission.date_of_birth).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Linkedin className="h-4 w-4 text-blue-500" />
                            <a href={admission.linkedin_profile} target="_blank" className="text-blue-500 hover:underline overflow-hidden text-ellipsis whitespace-nowrap">LinkedIn Profile</a>
                        </div>
                        <Separator className="my-2" />
                        <div className="pt-2">
                            <Button className="w-full" asChild>
                                <a href={admission.resume_cv} target="_blank" download>
                                    <Download className="mr-2 h-4 w-4" /> Download CV / Resume
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-md border-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Professional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Applied Course</h4>
                                    <div className="text-lg font-bold text-primary">{admission.course_name || "N/A"}</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Selected Batch</h4>
                                    <div className="text-lg font-bold text-primary">{admission.batch_name || "N/A"}</div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Professional Experience</h4>
                                <p className="leading-relaxed whitespace-pre-wrap">{admission.experience}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Current Employer / University</h4>
                                <p className="font-medium">{admission.current_employer_university}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-primary/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Guardian & Permanent Record</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-primary underline">Father Details</h4>
                                    <p className="text-sm"><strong>Name:</strong> {admission.father_name || "N/A"}</p>
                                    <p className="text-sm"><strong>Phone:</strong> {admission.father_phone || "N/A"}</p>
                                    <p className="text-sm"><strong>Occupation:</strong> {admission.father_occupation || "N/A"}</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-primary underline">Mother Details</h4>
                                    <p className="text-sm"><strong>Name:</strong> {admission.mother_name || "N/A"}</p>
                                    <p className="text-sm"><strong>Phone:</strong> {admission.mother_phone || "N/A"}</p>
                                    <p className="text-sm"><strong>Occupation:</strong> {admission.mother_occupation || "N/A"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-primary underline">Local Guardian</h4>
                                    <p className="text-sm"><strong>Name:</strong> {admission.guardian_name || "N/A"} ({admission.guardian_relation})</p>
                                    <p className="text-sm"><strong>Email:</strong> {admission.guardian_email || "N/A"}</p>
                                    <p className="text-sm"><strong>Phone:</strong> {admission.guardian_phone || "N/A"}</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-primary underline flex items-center gap-1"><MapPin className="h-3 w-3" /> Permanent Address</h4>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{admission.guardian_address || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full bg-border ${className}`} />
}
