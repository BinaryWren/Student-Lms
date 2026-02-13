"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreVertical, Users, GraduationCap, Mail, Phone, Lock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "sonner"
import api from "@/lib/api"
import { useParams } from "next/navigation"

export default function InstructorsPage() {
    const params = useParams();
    const instituteId = params.id;
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Add Instructor State
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Invite Instructor State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "INSTRUCTOR",
        institute: parseInt(instituteId as string) || 1,

        // Profile text fields
        linkedin_url: "",
        website_url: "",
        address: "",
        experience: "",
    });

    // File State
    const [picFile, setPicFile] = useState<File | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const res = await api.get('/users/', { params: { role: 'INSTRUCTOR' } });
            const data = res.data.results || res.data;
            setInstructors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load instructors");
        } finally {
            setLoading(false);
        }
    };

    const handleInviteInstructor = async () => {
        if (!inviteEmail) return toast.error("Email is required");
        try {
            const res = await api.post('/invitations/invite/', { email: inviteEmail });
            // Simulate Email Sending by showing link
            navigator.clipboard.writeText(res.data.link);
            toast.success("Invitation Link generated!", {
                description: `Link copied to clipboard: ${res.data.link}. (Usually sent via email)`,
                duration: 10000
            });
            setIsInviteOpen(false);
            setInviteEmail("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to invite");
        }
    }

    const handleCreateInstructor = async () => {
        if (!formData.email || !formData.password || !formData.first_name) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            // 1. Create User
            // 1. Create User
            const userPayload = {
                username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000), // Generate a username
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: "INSTRUCTOR",
                institute: formData.institute,
            };

            const res = await api.post('/users/', userPayload);
            const newUserId = res.data.id;
            const newInstructorId = res.data.instructor_id || res.data.username;

            // 2. Upload Profile & Docs
            if (newUserId) {
                const docData = new FormData();
                if (picFile) docData.append('profile_picture', picFile);
                if (cvFile) docData.append('cv_file', cvFile);

                // Add text fields to FormData
                if (formData.linkedin_url) docData.append('linkedin_url', formData.linkedin_url);
                if (formData.website_url) docData.append('website_url', formData.website_url);
                if (formData.address) docData.append('address', formData.address);
                if (formData.experience) docData.append('experience', formData.experience);

                // Only call upload if we have data
                if (picFile || cvFile || formData.linkedin_url || formData.website_url || formData.address || formData.experience) {
                    await api.post(`/users/${newUserId}/upload_docs/`, docData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            toast.success(`Instructor Registered! ID: ${newInstructorId}`, {
                description: "Login using the generated Instructor ID.",
                duration: 8000
            });
            setIsAddOpen(false);
            setFormData({
                email: "", password: "", first_name: "", last_name: "", role: "INSTRUCTOR", institute: parseInt(instituteId as string) || 1,
                linkedin_url: "", website_url: "", address: "", experience: ""
            });
            setPicFile(null);
            setCvFile(null);
            fetchInstructors();
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.username ? "Username already exists" : "Failed to create instructor";
            toast.error(msg);
        }
    }

    if (loading) return <div>Loading instructors...</div>;

    const filteredInstructors = instructors.filter(inst =>
        (inst.instructor_id || inst.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inst.first_name + " " + inst.last_name).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Instructors</h2>
                    <p className="text-muted-foreground">Manage your teaching staff.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Mail className="mr-2 h-4 w-4" /> Invite via Email
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite Instructor</DialogTitle>
                                <DialogDescription>
                                    Send an invitation email to potential instructor. They will fill out their own profile.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="instructor@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleInviteInstructor}>Send Invitation</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Manually
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Instructor</DialogTitle>
                                <DialogDescription>
                                    Register a new instructor manually.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* Basic Info */}
                                <h3 className="text-sm font-medium border-b pb-2">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john.doe@institute.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Instructor ID</Label>
                                        <Input
                                            value="Auto-generated"
                                            disabled
                                            className="bg-muted text-muted-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Secret123"
                                        />
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <h3 className="text-sm font-medium border-b pb-2 pt-2">Profile Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>LinkedIn URL</Label>
                                        <Input
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Website URL</Label>
                                        <Input
                                            value={formData.website_url}
                                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                            placeholder="https://mysite.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Home Address</Label>
                                    <Textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Full Address..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Experience / Bio</Label>
                                    <Textarea
                                        className="min-h-[100px]"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        placeholder="Previous experience, skills, etc."
                                    />
                                </div>

                                {/* Files */}
                                <h3 className="text-sm font-medium border-b pb-2 pt-2">Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Profile Picture</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setPicFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>CV / Resume</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateInstructor}>Create Instructor</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search instructors..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredInstructors.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No instructors found.
                    </div>
                ) : filteredInstructors.map((inst: any) => (
                    <Card key={inst.id} className="group hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center gap-4 p-4">
                            {inst.profile?.profile_picture ? (
                                <img
                                    src={inst.profile.profile_picture}
                                    alt={inst.username}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {inst.first_name?.[0] || inst.username?.[0] || "?"}
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <CardTitle className="text-base truncate">{inst.first_name} {inst.last_name}</CardTitle>
                                <CardDescription className="truncate">@{inst.instructor_id || inst.username}</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => toast.info("Profile edit coming soon")}>Edit Profile</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{inst.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span>Instructor</span>
                            </div>
                            {inst.profile?.linkedin_url && (
                                <div className="flex items-center gap-2">
                                    <a href={inst.profile.linkedin_url} target="_blank" className="text-blue-600 hover:underline text-xs">LinkedIn Profile</a>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href={`/institutes/${instituteId}/instructors/${inst.id}`}>View Full Profile</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
