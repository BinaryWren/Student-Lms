"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function GraduateStudentsPage() {
    const [graduates, setGraduates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGraduates()
    }, [])

    const fetchGraduates = async () => {
        try {
            const res = await api.get('/careers/graduates/')
            setGraduates(res.data.results || res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load graduates")
        } finally {
            setLoading(false)
        }
    }

    const handlePromote = async (id: number) => {
        if (!confirm("Promote this student to Alumni Directory?")) return;

        try {
            await api.post(`/careers/graduates/${id}/promote/`)
            toast.success("Student promoted to Alumni")
            // Remove from list
            setGraduates(prev => prev.filter(g => g.id !== id))
        } catch (e) {
            console.error(e)
            toast.error("Failed to promote student")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Graduate Students</h1>
                <p className="text-muted-foreground">Students who have completed courses but are not yet in the Alumni Directory.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {graduates.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No Pending Graduates</h3>
                        <p className="text-muted-foreground">All eligible graduates have been promoted to Alumni.</p>
                    </div>
                ) : graduates.map((grad) => (
                    <Card key={grad.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{grad.student?.username}</CardTitle>
                                    <CardDescription>{grad.student?.email}</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                    Completed
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div><span className="font-semibold">Batch:</span> {grad.batch_name}</div>
                            <div><span className="font-semibold">Enrolled:</span> {new Date(grad.enrolled_at).toLocaleDateString()}</div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handlePromote(grad.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Promote to Alumni
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
