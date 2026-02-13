"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, Filter, MoreHorizontal, Mail, ShieldAlert, BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import { Badge } from "@/components/ui/badge"

interface Student {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
    student_id: string;
    raw_password?: string;
}

interface Batch {
    id: number;
    name: string;
    program_name: string;
}

export default function StudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Add Student State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: ""
    });

    // Enrollment State
    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState("");

    // Credentials Dialog
    const [isCredsOpen, setIsCredsOpen] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchBatches();
    }, []);

    const fetchStudents = async (query = "") => {
        setLoading(true);
        try {
            const params: any = { role: 'STUDENT' };
            if (query) params.search = query;
            const res = await api.get('/users/', { params });
            setStudents(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    }

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches/');
            setBatches(res.data);
        } catch (error) {
            console.error("Failed to load batches", error);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents(search);
    }

    const handleAddStudent = async () => {
        try {
            await api.post('/users/', {
                ...newStudent,
                role: 'STUDENT',
                institute: typeof user?.institute === 'object' ? (user.institute as any).id : user?.institute
            });
            toast.success("Student created successfully");
            setIsAddOpen(false);
            setNewStudent({ username: "", email: "", password: "", first_name: "", last_name: "" });
            fetchStudents();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.username || "Failed to create student");
        }
    }

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedBatch) return;
        try {
            await api.post('/enrollments/', {
                student_id: selectedStudent.id,
                batch_id: selectedBatch,
                active: true
            });
            toast.success(`Enrolled ${selectedStudent.username} successfully`);
            setIsEnrollOpen(false);
            setSelectedBatch("");
            setSelectedStudent(null);
        } catch (error) {
            console.error(error);
            toast.error("Enrollment failed. Student might already be enrolled.");
        }
    }

    const openEnrollDialog = (student: Student) => {
        setSelectedStudent(student);
        setIsEnrollOpen(true);
    }

    const openCredsDialog = (student: Student) => {
        setSelectedStudent(student);
        setIsCredsOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Student Directory</h2>
                    <p className="text-muted-foreground">Manage and monitor student access.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Create Student Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>Create a student account manually. Note: Student ID will be auto-generated.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={newStudent.first_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={newStudent.last_name}
                                        onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Username / Student ID (Optional)</Label>
                                <Input
                                    value={newStudent.username}
                                    placeholder="Leave blank for auto-gen"
                                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    value={newStudent.password}
                                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddStudent}>Create Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <Button variant="outline" onClick={() => fetchStudents()}>
                            <Filter className="mr-2 h-4 w-4" /> Refresh
                        </Button>
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
                                    <TableHead>User Details</TableHead>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="font-bold text-slate-900">{student.first_name} {student.last_name}</div>
                                                <div className="text-xs text-muted-foreground">{student.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono text-[10px]">{student.username}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(student.date_joined).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${student.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                                    {student.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEnrollDialog(student)}>
                                                        <BookOpen className="mr-1 h-3.5 w-3.5" /> Enroll
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openCredsDialog(student)}>
                                                                <ShieldAlert className="mr-2 h-4 w-4" /> Login Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toast.info("Email feature pending")}>
                                                                <Mail className="mr-2 h-4 w-4" /> Send Email
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {/* Credentials Dialog */}
            <Dialog open={isCredsOpen} onOpenChange={setIsCredsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Login Credentials</DialogTitle>
                        <DialogDescription>
                            Use these details for the student portal:
                        </DialogDescription>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="bg-muted p-6 rounded-2xl space-y-4 border border-dashed text-center">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Portal Login ID</Label>
                                <p className="text-2xl font-black text-primary font-mono">{selectedStudent.username}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Temporary Password</Label>
                                <p className="text-xl font-bold text-slate-700">{selectedStudent.raw_password || "No data recorded"}</p>
                            </div>
                            <Button className="w-full h-11 font-bold rounded-full mt-4" onClick={() => {
                                navigator.clipboard.writeText(`ID: ${selectedStudent.username}\nPass: ${selectedStudent.raw_password}`);
                                toast.success("Credentials copied to clipboard");
                            }}>
                                Copy Login Info
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Enrollment Dialog */}
            <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enroll Student</DialogTitle>
                        <DialogDescription>
                            Enrolling {selectedStudent?.first_name} {selectedStudent?.last_name} ({selectedStudent?.username})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Batch</Label>
                            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a batch..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                            {batch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEnroll} disabled={!selectedBatch}>Confirm Enrollment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
