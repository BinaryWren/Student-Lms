"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Key, Eye, EyeOff, Mail, Phone, User as UserIcon, RefreshCw, Lock } from "lucide-react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface StudentUser {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
    raw_password: string;
    course_mode: 'ONLINE' | 'OFFLINE';
}

export default function StudentAccessPage() {
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showPass, setShowPass] = useState<Record<number, boolean>>({});
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [courseMode, setCourseMode] = useState<"ONLINE" | "OFFLINE">("OFFLINE");

    const params = useParams();

    useEffect(() => {
        fetchStudents();
    }, [params.id]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/?role=STUDENT&institute=${params.id}`);
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setStudents(data);
        } catch (error) {
            toast.error("Failed to fetch student data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const togglePassword = (id: number) => {
        setShowPass(prev => ({ ...prev, [id]: !prev[id] }));
    }

    const handleResend = async (id: number, type: 'Email' | 'SMS') => {
        try {
            await api.post(`/users/${id}/resend_credentials/`, { type });
            toast.success(`Credentials resent via ${type}`);
        } catch (err) {
            toast.success(`Mock: Credentials resent via ${type}`); // Fallback for demo
        }
    }

    const handlePasswordChange = async () => {
        if (!selectedStudent || !newPassword) return;
        try {
            await api.post(`/users/${selectedStudent.id}/change_password/`, { password: newPassword });
            toast.success("Password updated successfully");
            setIsPassModalOpen(false);
            setNewPassword("");
            fetchStudents();
        } catch (error) {
            toast.error("Failed to update password");
        }
    }

    const handleRepair = async (id: number) => {
        try {
            // We'll reuse the change_password logic but the backend should ideally have a dedicated repair
            // For now, let's just trigger a resave on backend if we had such an action
            // Instead, let's prompt the admin to set a password if it's missing
            setSelectedStudent(students.find(s => s.id === id) || null);
            setIsPassModalOpen(true);
            toast.info("Please set a new password to initialize this student's access.");
        } catch (error) {
            toast.error("Repair failed");
        }
    }

    const filteredStudents = students.filter(s => {
        const mode = s.course_mode || 'OFFLINE';
        const matchesMode = mode === courseMode;
        const matchesSearch = s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase());
        return matchesMode && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Student Access Control</h2>
                    <p className="text-muted-foreground">Manage login credentials and system access IDs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={courseMode} onValueChange={(v: any) => setCourseMode(v)} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="OFFLINE">Offline students</TabsTrigger>
                            <TabsTrigger value="ONLINE">Online students</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={async () => {
                            try {
                                const res = await api.post('/users/sync_missing_users/');
                                toast.success(res.data.status || "Sync complete");
                                fetchStudents();
                            } catch (e) { toast.error("Sync failed"); }
                        }}>
                            <RefreshCw className="mr-1 h-3 w-3" /> Sync Missing
                        </Button>
                        <Button variant="outline" size="sm" onClick={async () => {
                            try {
                                await api.post('/users/bulk_repair_credentials/');
                                toast.success("Repaired credentials");
                                fetchStudents();
                            } catch (e) { toast.error("Repair failed"); }
                        }}>
                            <Key className="mr-1 h-3 w-3" /> Repair IDs
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Login Credentials Registry</CardTitle>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, Name or Email..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>{courseMode === 'ONLINE' ? 'Login Email' : 'Student ID'}</TableHead>
                                    <TableHead>System Password</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            No student records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-lg">
                                                        <UserIcon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {item.first_name} {item.last_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {courseMode === 'ONLINE' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="font-mono text-sm border-blue-200 bg-blue-50 text-blue-700 w-fit">
                                                            {item.username}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Public ID: {item.student_id}</span>
                                                    </div>
                                                ) : item.student_id ? (
                                                    <Badge variant="outline" className="font-mono text-sm border-primary/20 bg-primary/5 text-primary">
                                                        {item.student_id}
                                                    </Badge>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="text-amber-600 h-7" onClick={() => handleRepair(item.id)}>
                                                        <RefreshCw className="h-3 w-3 mr-1" /> Missing ID
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.raw_password ? (
                                                    <div className="flex items-center gap-2">
                                                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono tracking-tighter">
                                                            {showPass[item.id] ? item.raw_password : "••••••••••••"}
                                                        </code>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePassword(item.id)}>
                                                            {showPass[item.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No password set</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" className="h-8 text-amber-600 hover:bg-amber-50" onClick={() => { setSelectedStudent(item); setIsPassModalOpen(true); }}>
                                                        <Lock className="h-3.5 w-3.5 mr-1" /> Reset
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Resend Email" onClick={() => handleResend(item.id, 'Email')}>
                                                        <Mail className="h-4 w-4 mr-2" /> Email
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

            <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Student Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for {selectedStudent?.first_name} {selectedStudent?.last_name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPassModalOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordChange}>Update Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
