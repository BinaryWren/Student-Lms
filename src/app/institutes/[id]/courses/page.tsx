"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreVertical, BookOpen, Users, Clock, Star, UserPlus, ArrowLeft, Wifi, Laptop } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"
import api from "@/lib/api"
import { useParams } from "next/navigation"

export default function CoursesPage() {
    const params = useParams();
    const instituteId = params.id;
    const [courses, setCourses] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Assign Dialog Component State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>("");
    const [viewMode, setViewMode] = useState<'main' | 'online' | 'offline'>('main');

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses/');
            setCourses(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            // Assuming this endpoint returns all users, we might need filtering. 
            // Ideally: /users/?role=INSTRUCTOR. If backend supports DjangoFilterBackend on UserViewSet.
            const res = await api.get('/users/', { params: { role: 'INSTRUCTOR' } });
            // Since standard ViewSet pagination might be on, check if results key exists
            const data = res.data.results || res.data;
            // Client side filter if backend doesn't filter by role query param (common issue)
            const insts = Array.isArray(data) ? data.filter((u: any) => u.role === 'INSTRUCTOR') : [];
            setInstructors(insts);
        } catch (error) {
            console.log("Failed to load instructors", error);
        }
    }

    const openAssignDialog = (course: any) => {
        setSelectedCourse(course);
        setSelectedInstructor(course.instructor ? String(course.instructor) : "");
        setIsAssignOpen(true);
    }

    const handleAssignInstructor = async () => {
        if (!selectedCourse || !selectedInstructor) return;
        try {
            await api.patch(`/courses/${selectedCourse.id}/`, {
                instructor: selectedInstructor
            });
            toast.success("Instructor assigned successfully");
            setIsAssignOpen(false);
            fetchCourses(); // Refresh
        } catch (e) {
            toast.error("Failed to assign instructor");
        }
    }

    const handleAction = (action: string) => {
        toast.info(`${action} feature is coming soon to the administration panel.`);
    };

    if (loading) return <div>Loading courses...</div>;

    if (viewMode === 'main') {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Choice Based Course System</h2>
                    <p className="text-muted-foreground">Select the type of course you want to manage.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <Card
                        className="group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                        onClick={() => setViewMode('online')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Wifi className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Online Course</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Manage virtual classrooms, live sessions, and digital-first learning experiences.
                        </CardContent>
                    </Card>

                    <Card
                        className="group relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                        onClick={() => setViewMode('offline')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Laptop className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Onsite Course</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground">
                            Manage standard curriculum, materials, and traditional course structures.
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (viewMode === 'online') {
        const onlineCourses = courses.filter(c => c.is_online_course);

        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('main')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Online Courses</h2>
                            <p className="text-muted-foreground">Manage digital curriculum and virtual classrooms.</p>
                        </div>
                    </div>
                    <Link href={`/institutes/${instituteId}/courses/create?mode=ONLINE`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Online Course
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {onlineCourses.length === 0 ? (
                        <div className="col-span-full text-center p-8 border-2 border-dashed rounded-lg">
                            <Wifi className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No online courses found. Create one to get started.</p>
                        </div>
                    ) : onlineCourses.map((course: any) => (
                        <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="aspect-video w-full bg-muted/40 relative group-hover:scale-105 transition-transform duration-500">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30">
                                        <Wifi className="h-10 w-10 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                        Online
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="p-4">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/institutes/${instituteId}/courses/${course.id}`}>
                                                    Curriculum Builder
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openAssignDialog(course)}>
                                                <UserPlus className="w-4 h-4 mr-2" /> Assign Instructor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {course.code}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0">
                                <Button variant="secondary" className="w-full" asChild>
                                    <Link href={`/institutes/${instituteId}/courses/${course.id}`}>Manage Content</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Readmission Requests</CardTitle>
                            <CardDescription>Review and approve readmission applications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ReadmissionRequestsTable />
                        </CardContent>
                    </Card>

                    <Card className="border-dashed">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wifi /> Live Class Management</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground mb-4">Schedule Zoom/Live sessions for your online courses.</p>
                            <Button variant="outline">Manage Live Sessions</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // viewMode === 'offline'
    const onsiteCourses = courses.filter(c => !c.is_online_course);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('main')} className="text-muted-foreground hover:text-foreground pl-0">
                        <ArrowLeft className="mr-1 h-3 w-3" /> Back to Selection
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Onsite Courses</h2>
                    <p className="text-muted-foreground">Manage your course catalog and content.</p>
                </div>
                <Link href={`/institutes/${instituteId}/courses/create`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search courses..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleAction("Filtering")}>Filter</Button>
                    <Button variant="outline" onClick={() => handleAction("Sorting")}>Sort</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {onsiteCourses.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No onsite courses found. Create one to get started.
                    </div>
                ) : onsiteCourses.map((course: any) => (
                    <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="aspect-video w-full bg-muted/40 relative group-hover:scale-105 transition-transform duration-500">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30">
                                    <BookOpen className="h-10 w-10 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <Badge className="bg-background/80 text-foreground backdrop-blur-sm shadow-sm hover:bg-background/90">
                                    Published
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/institutes/${instituteId}/courses/${course.id}`}>
                                                Curriculum Builder
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openAssignDialog(course)}>
                                            <UserPlus className="w-4 h-4 mr-2" /> Assign Instructor
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAction("Student Management")}>Manage Students</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => toast.error("You don't have permission to delete this course.")}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardDescription className="line-clamp-2">
                                {course.code} - {course.description || "No description provided."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{course.enrolled_count || 0} Students</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                    {course.instructor_name !== "Unassigned" ? `Instr: ${course.instructor_name}` : "No Instructor"}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href={`/institutes/${instituteId}/courses/${course.id}`}>Manage Content</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign Instructor</DialogTitle>
                        <DialogDescription>
                            Select an instructor for <strong>{selectedCourse?.title}</strong>. They will have permission to edit and manage content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="instructor" className="text-right">
                                Instructor
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructors.map((inst) => (
                                            <SelectItem key={inst.id} value={String(inst.id)}>
                                                {inst.username} ({inst.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleAssignInstructor}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ReadmissionRequestsTable() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/readmissions/');
            // Filter only pending for this view, or show all with status
            setRequests(res.data.filter((r: any) => r.status === 'PENDING'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/readmissions/${id}/approve/`, { comment: 'Approved by Admin' });
            toast.success("Student readmitted successfully");
            fetchRequests();
        } catch (e) {
            toast.error("Failed to approve");
        }
    }

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        try {
            await api.post(`/readmissions/${id}/reject/`, { comment: 'Rejected by Admin' });
            toast.success("Request rejected");
            fetchRequests();
        } catch (e) {
            toast.error("Failed to reject");
        }
    }

    if (loading) return <div>Loading requests...</div>;
    if (requests.length === 0) return <div className="text-muted-foreground text-sm">No pending readmission requests.</div>;

    return (
        <div className="rounded-md border">
            <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Course</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Reason</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {requests.map((req) => (
                        <tr key={req.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{req.student_name}</td>
                            <td className="p-4 align-middle">{req.course_title}</td>
                            <td className="p-4 align-middle max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                            <td className="p-4 align-middle">{new Date(req.created_at).toLocaleDateString()}</td>
                            <td className="p-4 align-middle text-right gap-2 flex justify-end">
                                <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700 h-8">Approve</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)} className="h-8">Reject</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
