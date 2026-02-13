"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Download, FileText, ArrowLeft, Briefcase, GraduationCap } from "lucide-react"

export default function InstructorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [instructor, setInstructor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await api.get(`/users/${params.instructorId}/`);
                setInstructor(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchInstructor();
    }, [params.instructorId]);

    if (loading) return <div>Loading Profile...</div>;
    if (!instructor) return <div>Instructor not found.</div>;

    const profile = instructor.profile || {};

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
            </div>

            {/* Header Card */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <CardContent className="relative pt-0 px-6 pb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="-mt-12 rounded-full border-4 border-background bg-background p-1">
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={profile.profile_picture} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold bg-muted">
                                    {instructor.first_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 mt-4 space-y-2">
                            <div>
                                <h1 className="text-3xl font-bold">{instructor.first_name} {instructor.last_name}</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Badge variant="secondary">Instructor</Badge>
                                    <span>@{instructor.username}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" /> {instructor.email}
                                </div>
                                {profile.address && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {profile.address.length > 30 ? profile.address.substring(0, 30) + '...' : profile.address}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            {profile.cv_file && (
                                <Button variant="outline" asChild>
                                    <a href={profile.cv_file} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4 mr-2" /> Download CV
                                    </a>
                                </Button>
                            )}
                            {profile.website_url && (
                                <Button variant="secondary" size="icon" asChild>
                                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="w-4 h-4" />
                                    </a>
                                </Button>
                            )}
                            {profile.linkedin_url && (
                                <Button className="bg-[#0077b5] hover:bg-[#006396]" size="icon" asChild>
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Email</span>
                                <span className="text-sm truncate" title={instructor.email}>{instructor.email}</span>
                            </div>
                            {profile.website_url && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Website</span>
                                    <a href={profile.website_url} target="_blank" className="text-sm text-blue-600 hover:underline truncate">
                                        {profile.website_url}
                                    </a>
                                </div>
                            )}
                            {profile.linkedin_url && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">LinkedIn</span>
                                    <a href={profile.linkedin_url} target="_blank" className="text-sm text-blue-600 hover:underline truncate">
                                        View Profile
                                    </a>
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Address</span>
                                <span className="text-sm">{profile.address || "No address provided"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {profile.cv_file ? (
                                <a href={profile.cv_file} target="_blank" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted border transition-colors">
                                    <div className="h-8 w-8 bg-red-100 text-red-600 rounded flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">Curriculum Vitae</p>
                                        <p className="text-xs text-muted-foreground">PDF Document</p>
                                    </div>
                                    <Download className="w-4 h-4 text-muted-foreground" />
                                </a>
                            ) : (
                                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="experience">
                        <TabsList>
                            <TabsTrigger value="experience">Experience & Bio</TabsTrigger>
                            <TabsTrigger value="courses">Assigned Courses</TabsTrigger>
                            <TabsTrigger value="activity">Activity Log</TabsTrigger>
                        </TabsList>
                        <TabsContent value="experience" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Background</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {profile.experience ? (
                                        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                            {profile.experience}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No experience information added yet.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="courses" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Teaching Assignments</CardTitle>
                                    <CardDescription>Courses currently taught by this instructor.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>Course list integration coming soon.</p>
                                        {/* To implement: Fetch courses where instructor=instructor.id */}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
