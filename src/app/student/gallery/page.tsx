"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Link as LinkIcon, Download, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function StudentGalleryPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await api.get('/gallery/')
            setItems(res.data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load resources")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Documents Gallery</h1>
                <p className="text-muted-foreground">Download helping materials, books, and reference links provided by your institute.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No documents found</h3>
                        <p className="text-muted-foreground">Check back later for new materials.</p>
                    </div>
                ) : items.map((item) => (
                    <Card key={item.id} className="group hover:border-emerald-500/50 transition-colors flex flex-col">
                        <CardHeader className="flex-none">
                            <div className="flex justify-between items-start gap-4">
                                <div className={`p-2 rounded-lg ${item.item_type === 'FILE' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {item.item_type === 'FILE' ? <FileText className="h-6 w-6" /> : <LinkIcon className="h-6 w-6" />}
                                </div>
                                <Badge variant="outline" className="text-xs uppercase">{item.item_type}</Badge>
                            </div>
                            <CardTitle className="pt-4 line-clamp-2 leading-tight" title={item.title}>
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.description || "No description provided."}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-muted/10">
                            {item.item_type === 'FILE' && item.file ? (
                                <Button className="w-full" asChild>
                                    <a href={item.file} target="_blank" rel="noreferrer" download>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </a>
                                </Button>
                            ) : item.url ? (
                                <Button className="w-full" variant="secondary" asChild>
                                    <a href={item.url} target="_blank" rel="noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                                    </a>
                                </Button>
                            ) : (
                                <Button className="w-full" disabled variant="ghost">Unavailable</Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
