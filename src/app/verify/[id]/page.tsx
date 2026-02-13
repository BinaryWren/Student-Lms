"use client"

import { useEffect, useState, use } from "react"
import { CheckCircle, XCircle, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function VerifyCertificate({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function verify() {
            try {
                const res = await fetch(`http://localhost:8000/api/verify/${params.id}/`)
                if (!res.ok) {
                    const json = await res.json()
                    throw new Error(json.message || "Invalid Certificate")
                }
                const json = await res.json()
                setData(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        verify()
    }, [params.id])

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    )

    if (error) return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md border-red-200 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-red-700">Verification Failed</CardTitle>
                    <CardDescription>Could not verify certificate authenticity.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    {error}
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg border-green-200 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-700">Valid Certificate</CardTitle>
                    <CardDescription>This certificate is authentic and issued by {data.institute}.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Awarded To</p>
                        <h3 className="text-3xl font-bold text-gray-900">{data.student}</h3>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">Course / Program</p>
                            <p className="font-semibold text-gray-800">{data.course}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase">Issued On</p>
                            <p className="font-semibold text-gray-800">{new Date(data.issued_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
                        Certificate ID: <span className="font-mono">{params.id}</span>
                    </div>
                </CardContent>

                <CardFooter className="bg-gray-50 p-6 flex flex-col gap-3">
                    {data.download_url && (
                        <Button className="w-full gap-2" size="lg" asChild>
                            <a href={`http://localhost:8000${data.download_url}`} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" /> Download Official PDF
                            </a>
                        </Button>
                    )}
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        Trusted Verification by OpenEduCat
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
