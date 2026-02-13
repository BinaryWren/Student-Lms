"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Download, ExternalLink, Loader2 } from "lucide-react"

interface Certificate {
    id: number;
    unique_id: string;
    student_name: string;
    course_title: string;
    template_name: string;
    issued_at: string;
    status: 'ISSUED' | 'REVOKED';
    pdf_file: string | null;
}

export default function StudentCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCertificates()
    }, [])

    async function fetchCertificates() {
        try {
            const res = await api.get('/certificates/')
            setCertificates(res.data)
        } catch (e) {
            console.error("Failed to fetch certificates", e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Certificates</h2>
                <p className="text-muted-foreground">View and download your earned credentials.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert) => (
                    <Card key={cert.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <Award className="h-6 w-6 text-yellow-600" />
                                </div>
                                <Badge variant={cert.status === 'ISSUED' ? 'default' : 'destructive'}>
                                    {cert.status}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4">{cert.course_title}</CardTitle>
                            <CardDescription>Issued on {new Date(cert.issued_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                <p>Certificate ID:</p>
                                <p className="font-mono text-xs">{cert.unique_id.slice(0, 13)}...</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            {cert.pdf_file && (
                                <div className="flex flex-col gap-2 flex-1">
                                    <a
                                        href={
                                            cert.pdf_file.startsWith('http')
                                                ? cert.pdf_file
                                                : `http://localhost:8000${cert.pdf_file.startsWith('/') ? '' : '/'}${cert.pdf_file}`
                                        }
                                        download={`Certificate-${cert.unique_id}.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2"
                                    >
                                        <Download className="h-4 w-4" /> Download PDF
                                    </a>
                                </div>
                            )}
                            <a
                                href={`/verify/${cert.unique_id}`}
                                target="_blank"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </CardFooter>
                    </Card>
                ))}

                {certificates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 py-12 text-center text-muted-foreground">
                        <Award className="h-12 w-12 opacity-20" />
                        <h3 className="mt-4 text-lg font-medium">No Certificates Yet</h3>
                        <p>Complete courses and pass exams to earn certificates.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
