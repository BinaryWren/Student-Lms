"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/lib/api"

export default function CreateCoursePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            // Note: In real app, we need institute ID and instructor ID
            // Backend currently requires institute. Let's assume the user has an institute linked.
        }

        try {
            await api.post('/courses/', data)
            router.push('/instructor/courses')
        } catch (err) {
            console.error(err)
            alert("Failed to create course. Ensure you are logged in as an instructor.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/instructor/courses"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>Fill in the basic information to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Master React and Next.js" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description</Label>
                            <Textarea id="description" name="description" placeholder="What will students learn?" rows={4} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : <><Save className="mr-2 h-4 w-4" /> Create Course</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
