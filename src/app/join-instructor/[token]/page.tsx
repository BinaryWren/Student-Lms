"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import api from "@/lib/api"
import Image from "next/image"

export default function JoinInstructorPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    // State
    const [loading, setLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    // Form Fields
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        // Profile
        linkedin_url: "",
        website_url: "",
        address: "",
        experience: ""
    });

    useEffect(() => {
        const validateToken = async () => {
            try {
                const res = await api.get('/invitations/validate/', { params: { token } });
                if (res.data.valid) {
                    setIsValid(true);
                    setInviteData(res.data);
                }
            } catch (error) {
                setIsValid(false);
                toast.error("Invalid or expired invitation link.");
            } finally {
                setLoading(false);
            }
        };
        if (token) validateToken();
    }, [token]);

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!formData.first_name || !formData.password) {
            toast.error("Please fill all required fields");
            return;
        }
        setProcessing(true);
        try {
            // 1. Accept Invite / Register
            const payload = {
                token,
                // Username generated on backend
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                profile: {
                    linkedin_url: formData.linkedin_url,
                    website_url: formData.website_url,
                    address: formData.address,
                    experience: formData.experience
                }
            };

            const res = await api.post('/invitations/accept/', payload);

            toast.success(`Registration Successful! Your ID: ${res.data.instructor_id}`, {
                description: "Please save this ID to login.",
                duration: 10000
            });

            setTimeout(() => {
                router.push('/login');
            }, 5000); // Give time to read ID

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Registration failed");
            setProcessing(false);
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Checking invitation...</div>;

    if (!isValid) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-red-500">Invalid Invitation</CardTitle>
                    <CardDescription>
                        This invitation link is invalid or has already been used. Please contact the administrator for a new link.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/')}>Go Home</Button>
                </CardFooter>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Join as Instructor</CardTitle>
                    <CardDescription className="text-center">
                        You have been invited to join <strong>{inviteData.institute_name}</strong>.
                        Please complete your registration below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {/* Account Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium border-b pb-2 text-muted-foreground">Account Credentials</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={inviteData.email} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>Instructor ID</Label>
                                <Input
                                    value="Auto-generated upon registration"
                                    disabled
                                    className="bg-muted text-muted-foreground italic"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Password <span className="text-red-500">*</span></Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium border-b pb-2 text-muted-foreground">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium border-b pb-2 text-muted-foreground">Professional Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>LinkedIn URL</Label>
                                <Input
                                    value={formData.linkedin_url}
                                    onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website URL</Label>
                                <Input
                                    value={formData.website_url}
                                    onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                                    placeholder="https://mysite.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Experience</Label>
                            <Textarea
                                value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleRegister} disabled={processing}>
                        {processing ? "Registering..." : "Complete Registration"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
